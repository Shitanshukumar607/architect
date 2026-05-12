
export interface Domain {
  id: string
  hostname: string
  verified: boolean
  createdAt?: string
  updatedAt?: string
}

export interface Project {
  id: string
  name: string
  domains: Domain[]
}
