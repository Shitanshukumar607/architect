import crypto from "crypto";
import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import {
  cancelOldQueuedDeployments,
  createDeploymentForProject,
} from "../models/deploymentModel";
import { generateId } from "../utils/generateId";

export async function getGitHubReposController(req: Request, res: Response) {
  try {
    const session = (req as any).session;
    const userId = session.user.id;

    // Find the GitHub account for this user to get the access token
    const account = await prisma.account.findFirst({
      where: {
        userId,
        providerId: "github",
      },
    });

    if (!account || !account.accessToken) {
      return res.status(400).json({
        error:
          "No GitHub account linked. Please sign in with GitHub to access your repositories.",
      });
    }

    // Fetch all repos (public + private) from GitHub API
    // Use pagination to get all repos
    const allRepos: any[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const response = await fetch(
        `https://api.github.com/user/repos?per_page=${perPage}&page=${page}&type=all&sort=updated&direction=desc`,
        {
          headers: {
            Authorization: `Bearer ${account.accessToken}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "Architect-App",
          },
        },
      );

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("GitHub API error:", response.status, errorBody);

        if (response.status === 401) {
          return res.status(401).json({
            error:
              "GitHub access token expired. Please re-authenticate with GitHub.",
          });
        }

        return res.status(502).json({
          error: "Failed to fetch repositories from GitHub",
        });
      }

      const repos = await response.json();

      if (!Array.isArray(repos) || repos.length === 0) {
        break;
      }

      allRepos.push(...repos);

      if (repos.length < perPage) {
        break;
      }

      page++;
    }

    const mapped = allRepos.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      private: repo.private,
      defaultBranch: repo.default_branch,
    }));

    return res.status(200).json(mapped);
  } catch (error) {
    console.error("Get GitHub repos error:", error);
    return res.status(500).json({ error: "Failed to fetch GitHub repos" });
  }
}

function normalizeGitUrl(url: string): string {
  return url
    .trim()
    .replace(/^(https?:\/\/|git@)/i, "")
    .replace(/^(github\.com[:/])/i, "")
    .replace(/\.git$/i, "")
    .toLowerCase();
}

function matchesRepo(
  projectRepoUrl: string,
  webhookRepoFullName: string,
  webhookCloneUrl?: string,
) {
  const normProject = normalizeGitUrl(projectRepoUrl);
  const normWebhookFullName = webhookRepoFullName.toLowerCase();

  if (normProject === normWebhookFullName) return true;

  if (webhookCloneUrl) {
    const normClone = normalizeGitUrl(webhookCloneUrl);
    if (normProject === normClone) return true;
  }

  return false;
}

export async function githubWebhookController(req: Request, res: Response) {
  try {
    const signature = req.headers["x-hub-signature-256"] as string;
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;

    if (webhookSecret) {
      if (!signature) {
        console.warn("[Webhook] Missing X-Hub-Signature-256 header");
        return res.status(401).json({ error: "Missing signature" });
      }

      const payload = JSON.stringify(req.body);
      const hmac = crypto
        .createHmac("sha256", webhookSecret)
        .update(payload)
        .digest("hex");

      const expectedSignature = `sha256=${hmac}`;

      try {
        const isVerified = crypto.timingSafeEqual(
          Buffer.from(signature),
          Buffer.from(expectedSignature),
        );
        if (!isVerified) {
          console.warn("[Webhook] Invalid signature");
          return res.status(401).json({ error: "Invalid signature" });
        }
      } catch (err) {
        console.error("[Webhook] Signature verification error:", err);
        return res.status(401).json({ error: "Signature verification failed" });
      }
    }

    const event = req.headers["x-github-event"];
    if (event === "ping") {
      console.log("[Webhook] Received ping event from GitHub");
      return res.status(200).json({ ok: true, message: "pong" });
    }

    if (event !== "push") {
      console.log(`[Webhook] Ignoring unhandled event: ${event}`);
      return res
        .status(200)
        .json({ ok: true, message: `Ignored event: ${event}` });
    }

    const { ref, after: commitSha, repository, head_commit } = req.body;

    if (!ref || !commitSha || !repository) {
      return res.status(400).json({ error: "Invalid webhook payload format" });
    }

    // Ignore 0000000000000000000000000000000000000000 (branch deletion events)
    if (commitSha === "0000000000000000000000000000000000000000") {
      console.log("[Webhook] Branch deletion push. Ignoring.");
      return res
        .status(200)
        .json({ ok: true, message: "Ignored branch deletion" });
    }

    const branch = ref.replace("refs/heads/", "");
    const fullName = repository.full_name;
    const cloneUrl = repository.clone_url;
    const commitMessage = head_commit?.message || "Auto-deploy from push";

    console.log(
      `[Webhook] PUSH event received for ${fullName} on branch ${branch} (SHA: ${commitSha})`,
    );

    // Find all active projects that are connected to this repo and have autoDeploy enabled
    const projects = await prisma.project.findMany({
      where: {
        autoDeploy: true,
        status: "ACTIVE",
      },
    });

    const matchingProjects = projects.filter((project) =>
      matchesRepo(project.repoUrl, fullName, cloneUrl),
    );

    if (matchingProjects.length === 0) {
      console.log(
        `[Webhook] No active projects with autoDeploy match repo: ${fullName}`,
      );
      return res
        .status(200)
        .json({ ok: true, message: "No matching projects" });
    }

    const triggeredDeployments = [];

    for (const project of matchingProjects) {
      if (branch !== project.branch) {
        console.log(
          `[Webhook] Skipping project ${project.name}: push branch '${branch}' doesn't match project branch '${project.branch}'`,
        );
        continue;
      }

      console.log(
        `[Webhook] Triggering auto-deploy for project: ${project.name} (${project.id})`,
      );

      // Cancel older queued deployments to prevent duplicate builds
      await cancelOldQueuedDeployments(project.id);

      // Create new deployment
      const deploymentId = generateId();
      const deployment = await createDeploymentForProject({
        id: deploymentId,
        userId: project.userId,
        projectId: project.id,
        repoUrl: project.repoUrl,
        buildCommand: project.buildCommand,
        outputDir: project.outputDir,
        commitSha,
        commitMessage,
      });

      triggeredDeployments.push({
        projectName: project.name,
        deploymentId: deployment.id,
      });
    }

    return res.status(200).json({
      ok: true,
      message: `Triggered ${triggeredDeployments.length} auto-deployments`,
      deployments: triggeredDeployments,
    });
  } catch (error) {
    console.error("[Webhook] Error processing GitHub webhook:", error);
    return res.status(500).json({ error: "Failed to process webhook" });
  }
}
