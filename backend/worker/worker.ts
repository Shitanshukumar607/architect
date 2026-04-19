import { pop } from "../queue/queue";
import { updateDeploymentStatus } from "../models/deploymentModel";
import { exec } from "child_process";
import util from "util";
import path from "path";
import fs from "fs";

const execPromise = util.promisify(exec);

async function processJobs() {
  while (true) {
    const job = pop();
    if (job) {
      console.log(`[Worker] Started processing deployment: ${job.id}`);

      updateDeploymentStatus(job.id, "building");

      try {
        const tmpDir = path.join(process.cwd(), "tmp", job.id);

        if (fs.existsSync(tmpDir)) {
          fs.rmSync(tmpDir, { recursive: true, force: true });
        }
        fs.mkdirSync(tmpDir, { recursive: true });

        console.log(
          `[Worker] Cloning repository ${job.repoUrl} into ${tmpDir}`,
        );
        await execPromise(`git clone ${job.repoUrl} ${tmpDir}`);

        console.log(`[Worker] Installing dependencies for ${job.id}`);
        await execPromise(`npm install`, { cwd: tmpDir });

        console.log(
          `[Worker] Running build command for ${job.id}: ${job.buildCommand}`,
        );
        await execPromise(job.buildCommand, { cwd: tmpDir });

        const outputDirPath = path.join(tmpDir, job.outputDir);
        if (fs.existsSync(outputDirPath)) {
          updateDeploymentStatus(job.id, "success");
          console.log(
            `[Worker] Deployment ${job.id} completed successfully. Output at ${outputDirPath}`,
          );
        } else {
          throw new Error(`Output directory ${job.outputDir} not found`);
        }
      } catch (error) {
        updateDeploymentStatus(job.id, "failed");
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
