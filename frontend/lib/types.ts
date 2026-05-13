export interface Domain {
  id: string
  hostname: string
  verified: boolean
}

export interface DeploymentLog {
  id: string
  level: string
  message: string
  timestamp: string
}

export interface Deployment {
  id: string
  projectId?: string
  status: string
  createdAt: string
  updatedAt?: string
  finishedAt?: string
  buildCommand?: string
  repoUrl?: string
  logs?: DeploymentLog[]
}

export interface EnvVar {
  id: string
  key: string
  value: string
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  name: string
  repoUrl: string
  createdAt: string
  framework: string
  buildCommand: string
  outputDir: string
  domains: Domain[]
  deployments: Deployment[]
  envVars: EnvVar[]
}
