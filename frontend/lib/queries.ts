import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchProjects,
  fetchProjectByName,
  fetchProjectDeployments,
  createProject,
  deployProject,
  fetchProjectEnvVars,
  fetchDeploymentLogs,
  updateProject,
  createProjectEnvVar,
  updateProjectEnvVar,
  deleteProjectEnvVar,
  createProjectDomain,
  updateProjectDomain,
  deleteProjectDomain,
  verifyProjectDomain
} from "./api"
import { Project, Deployment, EnvVar } from "./types"

export const USE_PROJECTS_KEY = "projects"
export const USE_PROJECT_KEY = "project"
export const USE_DEPLOYMENTS_KEY = "deployments"
export const USE_ENV_VARS_KEY = "envVars"

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: [USE_PROJECTS_KEY],
    queryFn: fetchProjects,
  })
}

export function useProject(projectName: string) {
  return useQuery<Project>({
    queryKey: [USE_PROJECT_KEY, projectName],
    queryFn: () => fetchProjectByName(projectName),
    enabled: !!projectName,
  })
}

export function useDeployments(projectId: string) {
  return useQuery<Deployment[]>({
    queryKey: [USE_DEPLOYMENTS_KEY, projectId],
    queryFn: () => fetchProjectDeployments(projectId),
    enabled: !!projectId,
  })
}

export function useEnvVars(projectName: string) {
  return useQuery<EnvVar[]>({
    queryKey: [USE_ENV_VARS_KEY, projectName],
    queryFn: () => fetchProjectEnvVars(projectName),
    enabled: !!projectName,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USE_PROJECTS_KEY] })
    },
  })
}

export function useDeployProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deployProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USE_PROJECT_KEY] })
      queryClient.invalidateQueries({ queryKey: [USE_DEPLOYMENTS_KEY] })
    },
  })
}

export const USE_DEPLOYMENT_LOGS_KEY = "deploymentLogs"

export function useDeploymentLogs(deploymentId: string) {
  return useQuery<Deployment>({
    queryKey: [USE_DEPLOYMENT_LOGS_KEY, deploymentId],
    queryFn: () => fetchDeploymentLogs(deploymentId),
    enabled: !!deploymentId,
    refetchInterval: (query) => {
      const data = query.state.data
      if (data && (data.status === "QUEUED" || data.status === "BUILDING")) {
        return 3000
      }
      return false
    },
  })
}

export function useCreateEnvVar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createProjectEnvVar,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [USE_ENV_VARS_KEY, variables.projectName] })
    },
  })
}

export function useUpdateEnvVar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateProjectEnvVar,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [USE_ENV_VARS_KEY, variables.projectName] })
    },
  })
}

export function useDeleteEnvVar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteProjectEnvVar,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [USE_ENV_VARS_KEY, variables.projectName] })
    },
  })
}

export function useCreateDomain() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createProjectDomain,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [USE_PROJECT_KEY, variables.projectName] })
    },
  })
}

export function useUpdateDomain() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateProjectDomain,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [USE_PROJECT_KEY, variables.projectName] })
    },
  })
}

export function useDeleteDomain() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteProjectDomain,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [USE_PROJECT_KEY, variables.projectName] })
    },
  })
}

export function useVerifyDomain() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: verifyProjectDomain,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [USE_PROJECT_KEY, variables.projectName] })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectName, data }: { projectName: string, data: Partial<Project> }) =>
      updateProject(projectName, data),
    onSuccess: (updatedProject, variables) => {
      queryClient.invalidateQueries({ queryKey: [USE_PROJECTS_KEY] })
      queryClient.invalidateQueries({ queryKey: [USE_PROJECT_KEY, variables.projectName] })
    },
  })
}
