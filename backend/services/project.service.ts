import { ProjectFramework } from "@prisma/client";
import {
  createProject,
  createProjectDomain,
  createProjectEnvVar,
  deleteProjectEnvVarById,
  findProjectDomainById,
  findProjectEnvVarById,
  getProjectByIdForUser,
  getProjectByNameForUser,
  listProjectEnvVarsByProjectId,
  listProjectsByUser,
  updateProjectById,
  updateProjectDomainById,
  updateProjectEnvVarById,
  deleteProjectById,
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
      const target = error?.meta?.target;
      const targetFields = Array.isArray(target)
        ? target.map((field) => String(field))
        : typeof target === "string"
          ? [target]
          : [];
      const targetText = targetFields.join(",");

      if (
        targetFields.includes("repoUrl") ||
        targetText.includes("repoUrl")
      ) {
        throw new ServiceError(
          "A project with this repository already exists",
          400,
        );
      }

      if (
        (targetFields.includes("userId") && targetFields.includes("name")) ||
        (targetText.includes("userId") && targetText.includes("name"))
      ) {
        throw new ServiceError(
          "A project with this name already exists",
          400,
        );
      }

      throw new ServiceError("A project with these details already exists", 400);
    }
    throw error;
  }
}

type UpdateProjectPayload = {
  name?: unknown;
  branch?: unknown;
  rootDirectory?: unknown;
  autoDeploy?: unknown;
  buildCommand?: unknown;
  outputDir?: unknown;
  framework?: unknown;
};

export async function updateProject(
  userId: string,
  projectName: string,
  payload: UpdateProjectPayload,
) {
  const project = await getProjectByName(userId, projectName);

  const {
    name,
    branch,
    rootDirectory,
    autoDeploy,
    buildCommand,
    outputDir,
    framework,
  } = payload;

  const data: any = {};

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length === 0) {
      throw new ServiceError("Project name must be a non-empty string", 400);
    }
    data.name = normalizeProjectName(name.trim());
  }

  if (branch !== undefined) {
    if (typeof branch !== "string" || branch.trim().length === 0) {
      throw new ServiceError("Branch must be a non-empty string", 400);
    }
    data.branch = branch.trim();
  }

  if (rootDirectory !== undefined) {
    if (typeof rootDirectory !== "string") {
      throw new ServiceError("Root directory must be a string", 400);
    }
    data.rootDirectory = rootDirectory.trim() || "/";
  }

  if (autoDeploy !== undefined) {
    if (typeof autoDeploy !== "boolean") {
      throw new ServiceError("Auto deploy must be a boolean", 400);
    }
    data.autoDeploy = autoDeploy;
  }

  if (buildCommand !== undefined) {
    if (typeof buildCommand !== "string") {
      throw new ServiceError("Build command must be a string", 400);
    }
    data.buildCommand = buildCommand.trim();
  }

  if (outputDir !== undefined) {
    if (typeof outputDir !== "string" || outputDir.trim().length === 0) {
      throw new ServiceError("Output directory must be a non-empty string", 400);
    }
    data.outputDir = outputDir.trim();
  }

  if (framework !== undefined) {
    data.framework = framework as ProjectFramework;
  }

  if (Object.keys(data).length === 0) {
    throw new ServiceError("Nothing to update", 400);
  }

  try {
    return await updateProjectById(project.id, data);
  } catch (error: any) {
    if (error?.code === "P2002") {
      throw new ServiceError("A project with this name already exists", 400);
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

export async function deleteProject(userId: string, name: string) {
  const project = await getProjectByNameForUser(userId, name);
  if (!project) {
    throw new ServiceError("Project not found", 404);
  }

  return await deleteProjectById(project.id);
}

export async function addProjectDomain(
  userId: string,
  name: string,
  hostname: string,
) {
  if (hostname.trim().length === 0) {
    throw new ServiceError("hostname must be a non-empty string", 400);
  }

  const trimmedHostname = hostname.trim();
  const project = await getProjectByName(userId, name);

  try {
    return await createProjectDomain({
      hostname: trimmedHostname,
      projectId: project.id,
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      throw new ServiceError("Domain already exists", 400);
    }
    throw error;
  }
}

type UpdateProjectDomainPayload = {
  hostname?: unknown;
};

export async function updateProjectDomain(
  userId: string,
  name: string,
  domainId: string,
  payload: UpdateProjectDomainPayload,
) {
  if (!domainId) {
    throw new ServiceError("Domain not found", 404);
  }

  const { hostname } = payload;
  const data: { hostname?: string } = {};

  if (hostname !== undefined) {
    if (typeof hostname !== "string" || hostname.trim().length === 0) {
      throw new ServiceError("hostname must be a non-empty string", 400);
    }
    data.hostname = hostname.trim();
  }

  if (Object.keys(data).length === 0) {
    throw new ServiceError("Nothing to update", 400);
  }

  const project = await getProjectByName(userId, name);
  const domain = await findProjectDomainById(project.id, domainId);

  if (!domain) {
    throw new ServiceError("Domain not found", 404);
  }

  try {
    return await updateProjectDomainById(domain.id, data);
  } catch (error: any) {
    if (error?.code === "P2002") {
      throw new ServiceError("Domain already exists", 400);
    }
    throw error;
  }
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

  const keyPattern = /^[A-Z0-9_]+$/;
  if (!keyPattern.test(key)) {
    throw new ServiceError("Invalid environment variable key pattern. Only uppercase letters, numbers, and underscores are allowed.", 400);
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
    if (typeof key !== "string") {
      throw new ServiceError("key must be a non-empty string", 400);
    }
    const trimmedKey = key.trim();
    if (trimmedKey.length === 0) {
      throw new ServiceError("key must be a non-empty string", 400);
    }
    const keyPattern = /^[A-Z0-9_]+$/;
    if (!keyPattern.test(trimmedKey)) {
      throw new ServiceError("Invalid environment variable key pattern. Only uppercase letters, numbers, and underscores are allowed.", 400);
    }
    data.key = trimmedKey;
  }

  if (value !== undefined) {
    if (typeof value !== "string") {
      throw new ServiceError("value must be a non-empty string", 400);
    }
    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
      throw new ServiceError("value must be a non-empty string", 400);
    }
    data.value = trimmedValue;
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

export async function getProjectEnvVarValue(
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

  return envVar;
}

