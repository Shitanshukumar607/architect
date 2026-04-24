import { prisma } from "../lib/prisma";

export type DeploymentStatus = 'queued' | 'building' | 'success' | 'failed';

export interface Deployment {
    id: string;
    repoUrl: string;
    buildCommand: string;
    outputDir: string;
    status: string;
}

export async function createDeployment(id: string, repoUrl: string, buildCommand: string, outputDir: string) {
    return await prisma.deployment.create({
        data: {
            id,
            repoUrl,
            buildCommand,
            outputDir,
            status: 'queued'
        }
    });
}

export async function getDeployment(id: string) {
    return await prisma.deployment.findUnique({
        where: { id }
    });
}

export async function updateDeploymentStatus(id: string, status: DeploymentStatus) {
    return await prisma.deployment.update({
        where: { id },
        data: { status }
    });
}
