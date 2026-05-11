import { ProjectFramework } from "@prisma/client";
import {
  createProject,
  createProjectDomain,
  createProjectEnvVar,
  getProjectByIdForUser,
  getProjectByNameForUser,
  listProjectsByUser,
} from "../models/projectModel";
import { createDeploymentForProject } from "../models/deploymentModel";
import { generateId } from "../utils/generateId";
import { ServiceError } from "./service-error";

type CreateProjectPayload = {
  repoUrl: unknown;
  framework?: unknown;
  buildCommand?: unknown;
  outputDir?: unknown;
};

function getRepoName(repoUrl: string): string {
  return repoUrl.split("/").pop()?.replace(".git", "") || "project";
}

function normalizeProjectName(repoName: string): string {
  return repoName.toLowerCase().replace(/[^a-z0-9]/g, "-");
}

export async function createProjectForUser(
  userId: string,
  payload: CreateProjectPayload,
) {
  const { repoUrl, framework, buildCommand, outputDir } = payload;

  if (!repoUrl || typeof repoUrl !== "string") {
    throw new ServiceError("Repository URL is required", 400);
  }

  const repoName = getRepoName(repoUrl);
  const projectName = normalizeProjectName(repoName);

  try {
    const project = await createProject({
      name: projectName,
      repoUrl,
      framework: (framework as ProjectFramework) || ProjectFramework.VITE,
      buildCommand: (buildCommand as string) || "npm run build",
      outputDir: (outputDir as string) || "dist",
      userId,
    });

    const subdomain = `${projectName}-${generateId().slice(-5)}`;

    await createProjectDomain({
      hostname: subdomain,
      projectId: project.id,
      verified: true,
    });

    await createDeploymentForProject({
      id: generateId(),
      userId,
      projectId: project.id,
      repoUrl: project.repoUrl,
      buildCommand: project.buildCommand,
      outputDir: project.outputDir,
    });

    return project;
  } catch (error: any) {
    if (error?.code === "P2002") {
      throw new ServiceError(
        "A project with this repository already exists",
        400,
      );
    }
    throw error;
  }
}

export async function listProjectsForUser(userId: string) {
  return await listProjectsByUser(userId);
}

export async function getProjectById(userId: string, id?: string) {
  if (!id) {
    throw new ServiceError("Project not found", 404);
  }

  const project = await getProjectByIdForUser(userId, id);
  if (!project) {
    throw new ServiceError("Project not found", 404);
  }

  return project;
}

export async function getProjectByName(userId: string, name?: string) {
  if (!name) {
    throw new ServiceError("Project not found", 404);
  }

  const project = await getProjectByNameForUser(userId, name);
  if (!project) {
    throw new ServiceError("Project not found", 404);
  }

  return project;
}

export async function addProjectDomain(
  userId: string,
  name: string,
  hostname: string,
) {
  const project = await getProjectByName(userId, name);

  return await createProjectDomain({
    hostname,
    projectId: project.id,
  });
}

export async function addProjectEnvVar(
  userId: string,
  name: string,
  key: string,
  value: string,
) {
  const project = await getProjectByName(userId, name);

  return await createProjectEnvVar({
    key,
    value,
    projectId: project.id,
  });
}
