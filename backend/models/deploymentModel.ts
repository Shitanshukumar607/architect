export type DeploymentStatus = 'queued' | 'building' | 'success' | 'failed';

export interface Deployment {
    id: string;
    repoUrl: string;
    buildCommand: string;
    outputDir: string;
    status: DeploymentStatus;
}

const deployments = new Map<string, Deployment>();

export function createDeployment(id: string, repoUrl: string, buildCommand: string, outputDir: string): Deployment {
    const deployment: Deployment = {
        id,
        repoUrl,
        buildCommand,
        outputDir,
        status: 'queued'
    };
    deployments.set(id, deployment);
    return deployment;
}

export function getDeployment(id: string): Deployment | undefined {
    return deployments.get(id);
}

export function updateDeploymentStatus(id: string, status: DeploymentStatus): Deployment | null {
    const deployment = deployments.get(id);
    if (deployment) {
        deployment.status = status;
        return deployment;
    }
    return null;
}
