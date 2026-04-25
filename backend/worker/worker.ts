import { pop } from "../queue/queue";
import { updateDeploymentStatus } from "../models/deploymentModel";
import { DeploymentStatus } from "@prisma/client";
import { exec } from "child_process";
import util from "util";
import path from "path";
import fs from "fs";

const execPromise = util.promisify(exec);

async function processJobs() {
  while (true) {
    const job = await pop();
    if (job) {
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

        // Check if docker is available
        try {
          await execPromise("docker --version");
        } catch {
          throw new Error("Docker is not installed or not accessible");
        }

        console.log(`[Worker] Starting container ${containerName}`);
        // We mount the host's project tmp directory to container's /tmp to satisfy volume mounting requirement
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
            await execPromise(
              `docker exec -w /app ${containerName} npm install`,
            );

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
          // When destination does not exist, docker cp creates it and copies the contents of the source directory into it
          await execPromise(
            `docker cp ${containerName}:/app/${job.outputDir} ${tmpDir}`,
          );

          if (fs.existsSync(tmpDir)) {
            await updateDeploymentStatus(job.id, DeploymentStatus.SUCCESS, {
              finishedAt: new Date(),
            });
            console.log(
              `[Worker] Deployment ${job.id} completed successfully. Output at ${tmpDir}`,
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
    } else {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

export function startWorker() {
  console.log("[Worker] Started listening for jobs...");
  processJobs().catch(console.error);
}
