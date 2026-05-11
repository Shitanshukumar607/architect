import { ProjectFramework } from "@prisma/client";
import {
  createProject,
  createProjectDomain,
  createProjectEnvVar,
  deleteProjectEnvVarById,
  findProjectEnvVarById,
  getProjectByIdForUser,
  getProjectByNameForUser,
  listProjectEnvVarsByProjectId,
  listProjectsByUser,
  updateProjectEnvVarById,
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
  if (!key || typeof key !== "string") {
    throw new ServiceError("key is required", 400);
  }

  if (!value || typeof value !== "string") {
    throw new ServiceError("value is required", 400);
  }

  const project = await getProjectByName(userId, name);

  try {
    return await createProjectEnvVar({
      key,
      value,
      projectId: project.id,
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      throw new ServiceError("Environment variable key already exists", 400);
    }
    throw error;
  }
}

export async function listProjectEnvVars(userId: string, name: string) {
  const project = await getProjectByName(userId, name);

  return await listProjectEnvVarsByProjectId(project.id);
}

type UpdateProjectEnvVarPayload = {
  key?: unknown;
  value?: unknown;
};

export async function updateProjectEnvVar(
  userId: string,
  name: string,
  envVarId: string,
  payload: UpdateProjectEnvVarPayload,
) {
  if (!envVarId) {
    throw new ServiceError("Environment variable not found", 404);
  }

  const { key, value } = payload;
  const data: { key?: string; value?: string } = {};

  if (key !== undefined) {
    if (typeof key !== "string" || key.length === 0) {
      throw new ServiceError("key must be a non-empty string", 400);
    }
    data.key = key;
  }

  if (value !== undefined) {
    if (typeof value !== "string" || value.length === 0) {
      throw new ServiceError("value must be a non-empty string", 400);
    }
    data.value = value;
  }

  if (Object.keys(data).length === 0) {
    throw new ServiceError("Nothing to update", 400);
  }

  const project = await getProjectByName(userId, name);
  const envVar = await findProjectEnvVarById(project.id, envVarId);

  if (!envVar) {
    throw new ServiceError("Environment variable not found", 404);
  }

  try {
    return await updateProjectEnvVarById(envVar.id, data);
  } catch (error: any) {
    if (error?.code === "P2002") {
      throw new ServiceError("Environment variable key already exists", 400);
    }
    throw error;
  }
}

export async function deleteProjectEnvVar(
  userId: string,
  name: string,
  envVarId: string,
) {
  if (!envVarId) {
    throw new ServiceError("Environment variable not found", 404);
  }

  const project = await getProjectByName(userId, name);
  const envVar = await findProjectEnvVarById(project.id, envVarId);

  if (!envVar) {
    throw new ServiceError("Environment variable not found", 404);
  }

  return await deleteProjectEnvVarById(envVar.id);
}
