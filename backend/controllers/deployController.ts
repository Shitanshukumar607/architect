import { Request, Response } from "express";
import { createDeployment, getDeployment } from "../models/deploymentModel";
import { generateId } from "../utils/generateId";

const GIT_URL_REGEX = /^(https?:\/\/|git@).+/;

export async function createDeploymentController(req: Request, res: Response) {
  try {
    const { repoUrl, buildCommand, outputDir } = req.body;

    if (!repoUrl) {
      return res.status(400).json({ error: "repoUrl is required" });
    }

    if (typeof repoUrl !== "string" || !GIT_URL_REGEX.test(repoUrl)) {
      return res.status(400).json({
        error:
          "Invalid repoUrl format. Must be a valid git URL (HTTP/HTTPS or SSH)",
      });
    }

    if (buildCommand !== undefined && typeof buildCommand !== "string") {
      return res.status(400).json({ error: "buildCommand must be a string" });
    }

    if (outputDir !== undefined && typeof outputDir !== "string") {
      return res.status(400).json({ error: "outputDir must be a string" });
    }

    const id = generateId();

    const deployment = await createDeployment(
      id,
      repoUrl,
      (buildCommand as string) || "npm run build",
      (outputDir as string) || "dist",
    );

    return res.status(201).json({
      message: "Deployment queued successfully",
      deployment,
    });
  } catch (error) {
    console.error("Error in createDeploymentController:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getDeploymentController(req: Request, res: Response) {
  try {
    const { id } = req.params as { id: string };
    if (!id) {
      return res.status(400).json({ error: "Deployment ID is required" });
    }

    const deployment = await getDeployment(id);
    if (!deployment) {
      return res.status(404).json({ error: "Deployment not found" });
    }

    return res.json(deployment);
  } catch (error) {
    console.error("Error in getDeploymentController:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
