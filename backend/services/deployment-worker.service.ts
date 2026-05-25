import { Deployment, DeploymentStatus } from "@prisma/client";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import util from "util";
import { prisma } from "../lib/prisma";
import {
  addDeploymentLog,
  updateDeploymentStatus,
} from "../models/deploymentModel";
import { pop } from "../queue/queue";
import { uploadDirectoryToS3 } from "../utils/uploadToS3";

const execPromise = util.promisify(exec);

async function logAndPrint(jobId: string, level: string, message: string) {
  console.log(`[Worker - ${jobId}] ${message}`);
  await addDeploymentLog(jobId, level, message);
}

async function processDeploymentJob(job: Deployment) {
  await logAndPrint(job.id, "info", "Started processing deployment");

  await updateDeploymentStatus(job.id, DeploymentStatus.BUILDING, {
    startedAt: new Date(),
    finishedAt: null,
    errorMessage: null,
  });

  const projectTmpDir = path.join("/tmp", "deployments");
  const tmpDir = path.join(projectTmpDir, job.id);
  const containerName = `build-${job.id}`;

  // Pre-create the directory as the current user BEFORE docker run.
  // If we let Docker create it, the daemon creates it as root:root on the host
  // and the build container cannot write into it.
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
  fs.mkdirSync(tmpDir, { recursive: true });

  // get env vars
  let envVars: { key: string; value: string }[] = [];
  if (job.projectId) {
    envVars = await prisma.projectEnvVar.findMany({
      where: {
        projectId: job.projectId,
      },
    });
  }

  const envContent = envVars
    .map((env) => `${env.key}=${env.value}`)
    .join("\n");

  // create env
  const envPath = path.join("/tmp", `${job.id}.env`);
  fs.writeFileSync(envPath, envContent);

  try {
    try {
      await execPromise("docker --version");
    } catch {
      await logAndPrint(
        job.id,
        "error",
        "Docker is not installed or not accessible",
      );
      throw new Error("Docker is not installed or not accessible");
    }

    const outputDir = job.outputDir || "dist";
    await logAndPrint(job.id, "info", `Starting container ${containerName}`);
    await logAndPrint(job.id, "info", "Environment variables loaded"); 

    await execPromise(
      `docker run -d --name ${containerName} --env-file ${envPath} node:20 tail -f /dev/null`,
    );

    try {
      let branch = "main";
      if (job.projectId) {
        const project = await prisma.project.findUnique({
          where: { id: job.projectId },
          select: { branch: true },
        });
        if (project && project.branch) {
          branch = project.branch;
        }
      }

      await logAndPrint(
        job.id,
        "info",
        `Cloning repository inside container (branch: ${branch})`,
      );
      const { stdout: cloneOut, stderr: cloneErr } = await execPromise(
        `docker exec ${containerName} git clone -b ${branch} ${job.repoUrl} /repo`,
      );
      if (cloneOut) await logAndPrint(job.id, "info", cloneOut);
      if (cloneErr) await logAndPrint(job.id, "info", cloneErr);

      if (job.commitSha) {
        await logAndPrint(
          job.id,
          "info",
          `Checking out specific commit: ${job.commitSha}`,
        );
        const { stdout: checkoutOut, stderr: checkoutErr } = await execPromise(
          `docker exec -w /repo ${containerName} git checkout ${job.commitSha}`,
        );
        if (checkoutOut) await logAndPrint(job.id, "info", checkoutOut);
        if (checkoutErr) await logAndPrint(job.id, "info", checkoutErr);
      }

      if (job.buildCommand) {
        await logAndPrint(
          job.id,
          "info",
          `Installing dependencies inside container`,
        );
        const { stdout: npmOut, stderr: npmErr } = await execPromise(
          `docker exec -w /repo ${containerName} npm install`,
        );
        if (npmOut) await logAndPrint(job.id, "info", npmOut);
        if (npmErr) await logAndPrint(job.id, "info", npmErr);

        await logAndPrint(
          job.id,
          "info",
          `Running build command: ${job.buildCommand}`,
        );
        const { stdout: buildOut, stderr: buildErr } = await execPromise(
          `docker exec -w /repo ${containerName} ${job.buildCommand}`,
        );
        if (buildOut) await logAndPrint(job.id, "info", buildOut);
        if (buildErr) await logAndPrint(job.id, "info", buildErr);
      } else {
        await logAndPrint(
          job.id,
          "info",
          `No buildCommand provided; treating as static deployment`,
        );
      }

      // Copy build output from container to host tmpDir.
      await logAndPrint(job.id, "info", `Copying build output from container`);
      await execPromise(
        `docker cp ${containerName}:/repo/${outputDir}/. ${tmpDir}`,
      );

      const files = fs.readdirSync(tmpDir);
      if (files.length === 0) {
        throw new Error(
          `Build output directory is empty (outputDir: ${outputDir})`,
        );
      }

      await logAndPrint(job.id, "info", `Uploading files to S3`);
      await uploadDirectoryToS3(tmpDir, `deployments/${job.id}`);

      await updateDeploymentStatus(job.id, DeploymentStatus.SUCCESS, {
        finishedAt: new Date(),
      });
      await logAndPrint(job.id, "info", `Deployment completed successfully`);
    } finally {
      await logAndPrint(job.id, "info", `Cleaning up container`);
      await execPromise(`docker rm -f ${containerName}`).catch(() => {});
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await logAndPrint(job.id, "error", `Deployment failed: ${message}`);
    await updateDeploymentStatus(job.id, DeploymentStatus.FAILED, {
      finishedAt: new Date(),
      errorMessage: message,
    });
  } finally {
    if (fs.existsSync(envPath)) {
      try {
        fs.unlinkSync(envPath);
      } catch (err) {
        console.error(`Failed to delete temporary env file at ${envPath}:`, err);
      }
    }
  }
}

async function processJobs() {
  while (true) {
    try {
      const job = await pop();
      if (job) {
        await processDeploymentJob(job);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error("[Worker] Error in processJobs loop:", error);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

export function startWorker() {
  console.log("[Worker] Started listening for jobs...");
  processJobs().catch(console.error);
}
