import { createDeployment, getDeployment } from "../models/deploymentModel";
import { generateId } from "../utils/generateId";
import { ServiceError } from "./service-error";

const GIT_URL_REGEX = /^(https?:\/\/|git@).+/;

type CreateDeploymentPayload = {
  repoUrl: unknown;
  buildCommand?: unknown;
  outputDir?: unknown;
};

export async function createDeploymentForUser(
  userId: string,
  payload: CreateDeploymentPayload,
) {
  const { repoUrl, buildCommand, outputDir } = payload;

  if (!repoUrl) {
    throw new ServiceError("repoUrl is required", 400);
  }

  if (typeof repoUrl !== "string" || !GIT_URL_REGEX.test(repoUrl)) {
    throw new ServiceError(
      "Invalid repoUrl format. Must be a valid git URL (HTTP/HTTPS or SSH)",
      400,
    );
  }

  if (buildCommand !== undefined && typeof buildCommand !== "string") {
    throw new ServiceError("buildCommand must be a string", 400);
  }

  if (outputDir !== undefined && typeof outputDir !== "string") {
    throw new ServiceError("outputDir must be a string", 400);
  }

  const normalizedBuildCommand =
    typeof buildCommand === "string" && buildCommand.trim().length > 0
      ? buildCommand.trim()
      : null;

  const normalizedOutputDir =
    typeof outputDir === "string" && outputDir.trim().length > 0
      ? outputDir.trim()
      : normalizedBuildCommand
        ? "dist"
        : ".";

  const id = generateId();

  return await createDeployment({
    id,
    userId,
    repoUrl,
    buildCommand: normalizedBuildCommand,
    outputDir: normalizedOutputDir,
  });
}

export async function getDeploymentForUser(userId: string, id?: string) {
  if (!id) {
    throw new ServiceError("Deployment ID is required", 400);
  }

  const deployment = await getDeployment(id, userId);
  if (!deployment) {
    throw new ServiceError("Deployment not found", 404);
  }

  return deployment;
}
