import { Request, Response } from "express";
import {
  addProjectDomain,
  addProjectEnvVar,
  createProjectForUser,
  deleteProjectEnvVar,
  getProjectById,
  getProjectByName,
  listProjectsForUser,
  listProjectEnvVars,
  updateProject,
  updateProjectDomain,
  updateProjectEnvVar,
  deleteProject,
} from "../services/project.service";
import { ServiceError } from "../services/service-error";

export async function createProjectController(req: Request, res: Response) {
  try {
    const session = (req as any).session;
    const project = await createProjectForUser(session.user.id, req.body);

    return res.status(201).json(project);
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error("Create project error:", error);
    return res.status(500).json({ error: "Failed to create project" });
  }
}

export async function getProjectsController(req: Request, res: Response) {
  try {
    const session = (req as any).session;
    const projects = await listProjectsForUser(session.user.id);

    return res.status(200).json(projects);
  } catch (error) {
    console.error("Get projects error:", error);
    return res.status(500).json({ error: "Failed to fetch projects" });
  }
}

export async function getProjectByIdController(req: Request, res: Response) {
  try {
    const session = (req as any).session;
    const { id } = req.params as { id?: string };
    const project = await getProjectById(session.user.id, id);

    return res.status(200).json(project);
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error("Get project error:", error);
    return res.status(500).json({ error: "Failed to fetch project" });
  }
}

export async function getProjectByNameController(req: Request, res: Response) {
  try {
    const session = (req as any).session;
    const { name } = req.params as { name?: string };
    const project = await getProjectByName(session.user.id, name);

    return res.status(200).json(project);
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error("Get project by name error:", error);
    return res.status(500).json({ error: "Failed to fetch project" });
  }
}

export async function updateProjectController(req: Request, res: Response) {
  try {
    const session = (req as any).session;
    const { name } = req.params as { name: string };
    const project = await updateProject(session.user.id, name, req.body);

    return res.status(200).json(project);
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error("Update project error:", error);
    return res.status(500).json({ error: "Failed to update project" });
  }
}

export async function deleteProjectController(req: Request, res: Response) {
  try {
    const session = (req as any).session;
    const { name } = req.params as { name: string };
    
    await deleteProject(session.user.id, name);

    return res.status(200).json({ success: true });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error("Delete project error:", error);
    return res.status(500).json({ error: "Failed to delete project" });
  }
}

export async function addProjectDomainController(req: Request, res: Response) {
  try {
    const session = (req as any).session;
    const { name } = req.params as { name: string };
    const { hostname } = req.body as { hostname: string };

    const domain = await addProjectDomain(session.user.id, name, hostname);

    return res.status(201).json(domain);
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error("Add domain error:", error);
    return res.status(500).json({ error: "Failed to add domain" });
  }
}

export async function updateProjectDomainController(
  req: Request,
  res: Response,
) {
  try {
    const session = (req as any).session;
    const { name, domainId } = req.params as {
      name: string;
      domainId: string;
    };
    const { hostname } = req.body as { hostname?: string };

    const domain = await updateProjectDomain(session.user.id, name, domainId, {
      hostname,
    });

    return res.status(200).json(domain);
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error("Update domain error:", error);
    return res.status(500).json({ error: "Failed to update domain" });
  }
}

export async function addProjectEnvVarController(req: Request, res: Response) {
  try {
    const session = (req as any).session;
    const { name } = req.params as { name: string };
    const { key, value } = req.body as { key: string; value: string };

    const envVar = await addProjectEnvVar(session.user.id, name, key, value);

    return res.status(201).json(envVar);
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error("Add env var error:", error);
    return res.status(500).json({ error: "Failed to add env var" });
  }
}

export async function getProjectEnvVarsController(req: Request, res: Response) {
  try {
    const session = (req as any).session;
    const { name } = req.params as { name: string };

    const envVars = await listProjectEnvVars(session.user.id, name);

    return res.status(200).json(envVars);
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error("Get env vars error:", error);
    return res.status(500).json({ error: "Failed to fetch env vars" });
  }
}

export async function updateProjectEnvVarController(
  req: Request,
  res: Response,
) {
  try {
    const session = (req as any).session;
    const { name, envVarId } = req.params as {
      name: string;
      envVarId: string;
    };
    const { key, value } = req.body as { key?: string; value?: string };

    const envVar = await updateProjectEnvVar(session.user.id, name, envVarId, {
      key,
      value,
    });

    return res.status(200).json(envVar);
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error("Update env var error:", error);
    return res.status(500).json({ error: "Failed to update env var" });
  }
}

export async function deleteProjectEnvVarController(
  req: Request,
  res: Response,
) {
  try {
    const session = (req as any).session;
    const { name, envVarId } = req.params as {
      name: string;
      envVarId: string;
    };

    const envVar = await deleteProjectEnvVar(session.user.id, name, envVarId);

    return res.status(200).json(envVar);
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error("Delete env var error:", error);
    return res.status(500).json({ error: "Failed to delete env var" });
  }
}
