import { prisma } from "../lib/prisma";
import { ProjectFramework } from "@prisma/client";

type CreateProjectInput = {
  name: string;
  repoUrl: string;
  branch?: string;
  rootDirectory?: string;
  autoDeploy?: boolean;
  framework: ProjectFramework;
  buildCommand: string | null;
  outputDir: string;
  userId: string;
};

type UpdateProjectInput = {
  name?: string;
  branch?: string;
  rootDirectory?: string;
  autoDeploy?: boolean;
  framework?: ProjectFramework;
  buildCommand?: string;
  outputDir?: string;
};

type CreateProjectDomainInput = {
  hostname: string;
  projectId: string;
  verified?: boolean;
};

type CreateProjectEnvVarInput = {
  key: string;
  value: string;
  projectId: string;
};

type UpdateProjectEnvVarInput = {
  key?: string;
  value?: string;
};

type UpdateProjectDomainInput = {
  hostname?: string;
};

export async function createProject(input: CreateProjectInput) {
  return await prisma.project.create({
    data: {
      name: input.name,
      repoUrl: input.repoUrl,
      branch: input.branch ?? "main",
      rootDirectory: input.rootDirectory ?? "/",
      autoDeploy: input.autoDeploy ?? true,
      framework: input.framework,
      buildCommand: input.buildCommand ?? undefined,
      outputDir: input.outputDir,
      userId: input.userId,
    },
  });
}

export async function updateProjectById(
  projectId: string,
  data: UpdateProjectInput,
) {
  return await prisma.project.update({
    where: {
      id: projectId,
    },
    data,
  });
}

export async function listProjectsByUser(userId: string) {
  return await prisma.project.findMany({
    where: {
      userId,
    },
    include: {
      domains: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getProjectByIdForUser(userId: string, id: string) {
  return await prisma.project.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      domains: true,
      envVars: true,
      deployments: {
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
    },
  });
}

export async function getProjectByNameForUser(userId: string, name: string) {
  return await prisma.project.findFirst({
    where: {
      name,
      userId,
    },
    include: {
      domains: true,
      envVars: true,
      deployments: {
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
    },
  });
}

export async function createProjectDomain(input: CreateProjectDomainInput) {
  return await prisma.projectDomain.create({
    data: {
      hostname: input.hostname,
      projectId: input.projectId,
      verified: input.verified ?? false,
    },
  });
}

export async function findProjectDomainById(
  projectId: string,
  domainId: string,
) {
  return await prisma.projectDomain.findFirst({
    where: {
      id: domainId,
      projectId,
    },
  });
}

export async function updateProjectDomainById(
  domainId: string,
  data: UpdateProjectDomainInput,
) {
  return await prisma.projectDomain.update({
    where: {
      id: domainId,
    },
    data,
  });
}

export async function createProjectEnvVar(input: CreateProjectEnvVarInput) {
  return await prisma.projectEnvVar.create({
    data: {
      key: input.key,
      value: input.value,
      projectId: input.projectId,
    },
  });
}

export async function listProjectEnvVarsByProjectId(projectId: string) {
  return await prisma.projectEnvVar.findMany({
    where: {
      projectId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function findProjectEnvVarById(
  projectId: string,
  envVarId: string,
) {
  return await prisma.projectEnvVar.findFirst({
    where: {
      id: envVarId,
      projectId,
    },
  });
}

export async function updateProjectEnvVarById(
  envVarId: string,
  data: UpdateProjectEnvVarInput,
) {
  return await prisma.projectEnvVar.update({
    where: {
      id: envVarId,
    },
    data,
  });
}

export async function deleteProjectEnvVarById(envVarId: string) {
  return await prisma.projectEnvVar.delete({
    where: {
      id: envVarId,
    },
  });
}

export async function deleteProjectById(id: string) {
  return await prisma.project.delete({
    where: {
      id,
    },
  });
}
