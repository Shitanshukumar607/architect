export interface Domain {
  id: string
  hostname: string
  verified: boolean
}

export interface Project {
  id: string
  name: string
  repoUrl: string
  createdAt: string
  framework: string
  buildCommand: string
  outputDir: string
  domains?: Domain[]
}

export interface Deployment {
  id: string
  projectId: string
  status: string
  createdAt: string
  updatedAt: string
}
