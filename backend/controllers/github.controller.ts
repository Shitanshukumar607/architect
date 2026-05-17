import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

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
