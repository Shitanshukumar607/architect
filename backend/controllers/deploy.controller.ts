import { Request, Response } from "express";
import {
  createDeploymentForUser,
  getDeploymentForUser,
} from "../services/deployment.service";
import { ServiceError } from "../services/service-error";

export async function createDeploymentController(req: Request, res: Response) {
  try {
    const session = (req as any).session;
    const userId = session?.user?.id as string | undefined;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized. Please sign in." });
    }

    const deployment = await createDeploymentForUser(userId, req.body);

    return res.status(201).json({
      message: "Deployment queued successfully",
      deployment,
    });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error("Error in createDeploymentController:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getDeploymentController(req: Request, res: Response) {
  try {
    const session = (req as any).session;
    const userId = session?.user?.id as string | undefined;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized. Please sign in." });
    }

    const { id } = req.params as { id?: string };
    const deployment = await getDeploymentForUser(userId, id);

    return res.json(deployment);
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error("Error in getDeploymentController:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
