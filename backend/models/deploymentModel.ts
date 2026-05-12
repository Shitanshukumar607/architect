import { prisma } from "../lib/prisma";

import { DeploymentStatus, ProjectFramework } from "@prisma/client";

function inferProjectName(repoUrl: string): string {
  const trimmed = repoUrl.trim();

  // https://github.com/user/repo(.git)
  try {
    const url = new URL(trimmed);
    const parts = url.pathname.split("/").filter(Boolean);
    const candidate = parts[parts.length - 1] || "project";
    return candidate.replace(/\.git$/i, "");
  } catch {
    // git@github.com:user/repo(.git)
    const match = trimmed.match(/[:/]([^/\s]+\/[^/\s]+?)(?:\.git)?$/i);
    if (match?.[1]) {
      return match[1].split("/")[1] || "project";
    }
    return "project";
  }
}

export type CreateDeploymentInput = {
  id: string;
  userId: string;
  repoUrl: string;
  buildCommand: string | null;
  outputDir: string;
};

export async function createDeployment(input: CreateDeploymentInput) {
  const framework = input.buildCommand
    ? ProjectFramework.VITE
    : ProjectFramework.STATIC;

  const project = await prisma.project.upsert({
    where: {
      userId_repoUrl: {
        userId: input.userId,
        repoUrl: input.repoUrl,
      },
    },
    update: {
      buildCommand: input.buildCommand,
      outputDir: input.outputDir,
      framework,
    },
    create: {
      userId: input.userId,
      repoUrl: input.repoUrl,
      name: inferProjectName(input.repoUrl),
      buildCommand: input.buildCommand,
      outputDir: input.outputDir,
      framework,
    },
  });

  return await prisma.deployment.create({
    data: {
      id: input.id,
      userId: input.userId,
      projectId: project.id,
      repoUrl: input.repoUrl,
      buildCommand: input.buildCommand,
      outputDir: input.outputDir,
      status: DeploymentStatus.QUEUED,
    },
  });
}

export type CreateDeploymentForProjectInput = {
  id: string;
  userId: string;
  projectId: string;
  repoUrl: string;
  buildCommand: string | null;
  outputDir: string;
};

export async function createDeploymentForProject(
  input: CreateDeploymentForProjectInput,
) {
  return await prisma.deployment.create({
    data: {
      id: input.id,
      userId: input.userId,
      projectId: input.projectId,
      repoUrl: input.repoUrl,
      buildCommand: input.buildCommand,
      outputDir: input.outputDir,
      status: DeploymentStatus.QUEUED,
    },
  });
}

export async function getDeployment(id: string, userId: string) {
  return await prisma.deployment.findFirst({
    where: { id, userId },
    include: {
      logs: {
        orderBy: { timestamp: "asc" },
      },
    },
  });
}

export async function updateDeploymentStatus(
  id: string,
  status: DeploymentStatus,
  options?: {
    errorMessage?: string | null;
    startedAt?: Date | null;
    finishedAt?: Date | null;
  },
) {
  return await prisma.deployment.update({
    where: { id },
    data: {
      status,
      errorMessage: options?.errorMessage,
      startedAt: options?.startedAt,
      finishedAt: options?.finishedAt,
    },
  });
}

export async function findLatestSuccessfulDeploymentByDomain(hostname: string) {
  const domain = await prisma.projectDomain.findUnique({
    where: { hostname },
    include: {
      project: {
        include: {
          deployments: {
            where: { status: DeploymentStatus.SUCCESS },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  if (!domain || domain.project.deployments.length === 0) {
    return null;
  }

  return domain.project.deployments[0];
}

export async function findDeploymentByIdOnly(id: string) {
  return await prisma.deployment.findUnique({
    where: { id },
  });
}

export async function findLatestSuccessfulDeploymentByProjectName(
  name: string,
) {
  const project = await prisma.project.findFirst({
    where: { name },
    include: {
      deployments: {
        where: { status: DeploymentStatus.SUCCESS },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!project || project.deployments.length === 0) {
    return null;
  }

  return project.deployments[0];
}

export async function addDeploymentLog(
  deploymentId: string,
  level: string,
  message: string,
) {
  return await prisma.deploymentLog.create({
    data: {
      deploymentId,
      level,
      message,
    },
  });
}
