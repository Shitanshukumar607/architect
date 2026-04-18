import { pop } from '../queue/queue';
import { updateDeploymentStatus } from '../models/deploymentModel';

// Background worker process
// Simulated build execution
async function processJobs(): Promise<void> {
    while (true) {
        const job = pop();
        if (job) {
            console.log(`[Worker] Started processing deployment: ${job.id}`);
            
            // Update status to building
            updateDeploymentStatus(job.id, 'building');
            
            // Simulate build process taking 5 seconds
            await new Promise((resolve) => setTimeout(resolve, 5000));
            
            // Simulate random success/failure with 80% success rate
            const isSuccess = Math.random() > 0.2;
            
            if (isSuccess) {
                updateDeploymentStatus(job.id, 'success');
                console.log(`[Worker] Deployment ${job.id} completed successfully.`);
            } else {
                updateDeploymentStatus(job.id, 'failed');
                console.log(`[Worker] Deployment ${job.id} failed.`);
            }
        } else {
            // Wait before checking again if queue is empty
            await new Promise((resolve) => setTimeout(resolve, 2000));
        }
    }
}

export function startWorker() {
    console.log('[Worker] Started listening for jobs...');
    processJobs().catch(console.error);
}
