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

export async function getDeployment(id: string, userId: string) {
  return await prisma.deployment.findFirst({
    where: { id, userId },
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
