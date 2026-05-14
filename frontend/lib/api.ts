import { Project, Deployment, EnvVar, Domain, DeploymentLog } from "./types"

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export const fetchProjects = async (): Promise<Project[]> => {
  const response = await fetch(`${getBaseUrl()}/api/projects`, {
    credentials: "include",
  })
  if (!response.ok) throw new Error("Failed to fetch projects")
  return response.json()
}

export const fetchProjectByName = async (projectName: string): Promise<Project> => {
  const response = await fetch(
    `${getBaseUrl()}/api/projects/name/${projectName}`,
    { credentials: "include" }
  )
  if (!response.ok) throw new Error("Failed to fetch project")
  return response.json()
}

export const updateProject = async (
  projectName: string,
  data: Partial<Project>
): Promise<Project> => {
  const response = await fetch(`${getBaseUrl()}/api/projects/name/${projectName}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || "Failed to update project")
  }
  return response.json()
}

export const fetchProjectDeployments = async (projectId: string): Promise<Deployment[]> => {
  const response = await fetch(
    `${getBaseUrl()}/api/deploy?projectId=${projectId}`,
    { credentials: "include" }
  )
  if (!response.ok) throw new Error("Failed to fetch deployments")
  return response.json()
}

export const createProject = async (data: { repoUrl: string, framework: string, buildCommand: string, outputDir: string }): Promise<Project> => {
  const response = await fetch(`${getBaseUrl()}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || "Failed to create project")
  }
  return response.json()
}

export const deployProject = async (data: { repoUrl?: string, buildCommand?: string, outputDir?: string }): Promise<Deployment> => {
  const response = await fetch(`${getBaseUrl()}/api/deploy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to deploy")
  return response.json()
}

export const fetchProjectEnvVars = async (projectName: string): Promise<EnvVar[]> => {
  const response = await fetch(`${getBaseUrl()}/api/projects/name/${projectName}/env-vars`, { credentials: "include" })
  if (!response.ok) throw new Error("Failed to fetch env vars")
  return response.json()
}

export const fetchDeploymentLogs = async (deploymentId: string): Promise<Deployment & { logs: DeploymentLog[] }> => {
  const response = await fetch(`${getBaseUrl()}/api/deploy/${deploymentId}`, { credentials: "include" })
  if (!response.ok) throw new Error("Failed to fetch deployment logs")
  return response.json()
}

export const createProjectEnvVar = async ({ projectName, data }: { projectName: string, data: { key: string, value: string } }): Promise<EnvVar> => {
  const response = await fetch(`${getBaseUrl()}/api/projects/name/${projectName}/env-vars`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to create env var")
  return response.json()
}

export const updateProjectEnvVar = async ({ projectName, varId, data }: { projectName: string, varId: string, data: { key?: string, value?: string } }): Promise<EnvVar> => {
  const response = await fetch(`${getBaseUrl()}/api/projects/name/${projectName}/env-vars/${varId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to update env var")
  return response.json()
}

export const deleteProjectEnvVar = async ({ projectName, varId }: { projectName: string, varId: string }) => {
  const response = await fetch(`${getBaseUrl()}/api/projects/name/${projectName}/env-vars/${varId}`, {
    method: "DELETE",
    credentials: "include",
  })
  if (!response.ok) throw new Error("Failed to delete env var")
  return response.json()
}

export const createProjectDomain = async ({ projectName, hostname }: { projectName: string, hostname: string }): Promise<Domain> => {
  const response = await fetch(`${getBaseUrl()}/api/projects/name/${projectName}/domains`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ hostname }),
  })
  if (!response.ok) throw new Error("Failed to create domain")
  return response.json()
}

export const updateProjectDomain = async ({ projectName, domainId, hostname }: { projectName: string, domainId: string, hostname: string }): Promise<Domain> => {
  const response = await fetch(`${getBaseUrl()}/api/projects/name/${projectName}/domains/${domainId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ hostname }),
  })
  if (!response.ok) throw new Error("Failed to update domain")
  return response.json()
}

export const deleteProjectDomain = async ({ projectName, domainId }: { projectName: string, domainId: string }) => {
  const response = await fetch(`${getBaseUrl()}/api/projects/name/${projectName}/domains/${domainId}`, {
    method: "DELETE",
    credentials: "include",
  })
  if (!response.ok) throw new Error("Failed to delete domain")
  return response.json()
}

export const verifyProjectDomain = async ({ projectName, domainId }: { projectName: string, domainId: string }): Promise<Domain> => {
  const response = await fetch(`${getBaseUrl()}/api/projects/name/${projectName}/domains/${domainId}/verify`, {
    method: "POST",
    credentials: "include",
  })
  if (!response.ok) throw new Error("Failed to verify domain")
  return response.json()
}
