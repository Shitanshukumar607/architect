import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { DeploymentStatus } from "@prisma/client";
import { generateId } from "../utils/generateId";

export async function createProjectController(req: Request, res: Response) {
  try {
    const { name, repoUrl, framework, buildCommand, outputDir } = req.body;
    const session = (req as any).session;

    if (!name || !repoUrl) {
      return res
        .status(400)
        .json({ error: "Name and repository URL are required" });
    }

    const project = await prisma.project.create({
      data: {
        name,
        repoUrl,
        framework: framework || "VITE",
        buildCommand: buildCommand || "npm run build",
        outputDir: outputDir || "dist",
        userId: session.user.id,
      },
    });

    const subdomain = `${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${generateId().slice(-5)}.localhost`;

    await prisma.projectDomain.create({
      data: {
        hostname: subdomain,
        projectId: project.id,
        verified: true,
      },
    });

    await prisma.deployment.create({
      data: {
        id: generateId(),
        userId: session.user.id,
        projectId: project.id,
        repoUrl: project.repoUrl,
        buildCommand: project.buildCommand,
        outputDir: project.outputDir,
        status: DeploymentStatus.QUEUED,
      },
    });

    return res.status(201).json(project);
  } catch (error: any) {
    console.error("Create project error:", error);
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ error: "A project with this repository already exists" });
    }
    return res.status(500).json({ error: "Failed to create project" });
  }
}

export async function getProjectsController(req: Request, res: Response) {
  try {
    const session = (req as any).session;
    const projects = await prisma.project.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        domains: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(projects);
  } catch (error) {
    console.error("Get projects error:", error);
    return res.status(500).json({ error: "Failed to fetch projects" });
  }
}
