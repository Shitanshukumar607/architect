import { Request, Response } from "express";
import { getDeploymentAssetStream } from "../services/deployment-handler.service";
import { ServiceError } from "../services/service-error";

export async function deploymentHandlerController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const host = req.headers.host;

    if (!host) {
      res.status(400).send("No host header");
      return;
    }

    const asset = await getDeploymentAssetStream(host, req.path);
    res.setHeader("Content-Type", asset.contentType);
    asset.stream.pipe(res);
  } catch (err) {
    if (err instanceof ServiceError) {
      res.status(err.status).send(err.message);
      return;
    }
    console.error("[Deployment Handler] Error:", err);
    res.status(500).send("Server error");
  }
}
