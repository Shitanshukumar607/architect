import { Deployment, DeploymentStatus } from "@prisma/client";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import util from "util";
import { pop } from "../queue/queue";
import { updateDeploymentStatus } from "../models/deploymentModel";
import { uploadDirectoryToS3 } from "../utils/uploadToS3";
import { rewriteHtmlPaths } from "../utils/rewritePaths";

const execPromise = util.promisify(exec);

async function processDeploymentJob(job: Deployment) {
  console.log(`[Worker] Started processing deployment: ${job.id}`);

  await updateDeploymentStatus(job.id, DeploymentStatus.BUILDING, {
    startedAt: new Date(),
    finishedAt: null,
    errorMessage: null,
  });

  const projectTmpDir = path.join(process.cwd(), "tmp");
  const tmpDir = path.join(projectTmpDir, job.id);
  const containerName = `build-${job.id}`;

  try {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }

    try {
      await execPromise("docker --version");
    } catch {
      throw new Error("Docker is not installed or not accessible");
    }

    console.log(`[Worker] Starting container ${containerName}`);
    await execPromise(
      `docker run -d --name ${containerName} -v ${projectTmpDir}:/tmp node:20 tail -f /dev/null`,
    );

    try {
      console.log(`[Worker] Cloning repository inside container`);
      await execPromise(
        `docker exec ${containerName} git clone ${job.repoUrl} /app`,
      );

      if (job.buildCommand) {
        console.log(`[Worker] Installing dependencies inside container`);
        await execPromise(`docker exec -w /app ${containerName} npm install`);

        console.log(`[Worker] Running build command inside container`);
        await execPromise(
          `docker exec -w /app ${containerName} ${job.buildCommand}`,
        );
      } else {
        console.log(
          `[Worker] No buildCommand provided; treating as static deployment`,
        );
      }

      console.log(`[Worker] Copying output to host using docker cp`);
      await execPromise(
        `docker cp ${containerName}:/app/${job.outputDir} ${tmpDir}`,
      );

      if (fs.existsSync(tmpDir)) {
        // rewriteHtmlPaths(tmpDir, job.id);
        console.log(`[Worker] Uploading files to S3`);
        await uploadDirectoryToS3(tmpDir, `deployments/${job.id}`);

        await updateDeploymentStatus(job.id, DeploymentStatus.SUCCESS, {
          finishedAt: new Date(),
        });
        console.log(
          `[Worker] Deployment ${job.id} completed successfully. Uploaded to S3 at deployments/${job.id}`,
        );
      } else {
        throw new Error(`Output directory ${job.outputDir} not found`);
      }
    } finally {
      console.log(`[Worker] Cleaning up container ${containerName}`);
      await execPromise(`docker rm -f ${containerName}`).catch(() => {});
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await updateDeploymentStatus(job.id, DeploymentStatus.FAILED, {
      finishedAt: new Date(),
      errorMessage: message,
    });
    console.error(`[Worker] Deployment ${job.id} failed:`, error);
  }
}

async function processJobs() {
  while (true) {
    const job = await pop();
    if (job) {
      await processDeploymentJob(job);
    } else {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

export function startWorker() {
  console.log("[Worker] Started listening for jobs...");
  processJobs().catch(console.error);
}
