import { Request, Response } from "express";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { sdkStreamMixin } from "@aws-sdk/util-stream-node";
import mime from "mime-types";
import { prisma } from "../lib/prisma";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
});

const S3_BUCKET_NAME = process.env.S3_BUCKET || "architect-deployments";

/**
 * Catch-all handler for serving deployed projects from S3
 * Routes requests to the correct deployment based on subdomain
 */
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

    const subdomain = host.split(".")[0];

    // // Optional: ignore root domain
    // if (subdomain === "architect" || subdomain === "localhost") {
    //   res.status(404).send("Not a deployment subdomain");
    //   return;
    // }

    // 1. DB lookup - find project domain
    // const projectDomain = await prisma.projectDomain.findUnique({
    //   where: { hostname: host },
    //   include: {
    //     project: true,
    //   },
    // });

    // if (!projectDomain) {
    //   res.status(404).send("Deployment not found");
    //   return;
    // }

    // // 2. Get latest successful deployment for this project
    // const deployment = await prisma.deployment.findFirst({
    //   where: {
    //     projectId: projectDomain.projectId,
    //     status: "SUCCESS",
    //   },
    //   orderBy: {
    //     finishedAt: "desc",
    //   },
    // });

    // if (!deployment) {
    //   res.status(404).send("No successful deployment found");
    //   return;
    // }

    // const deploymentId = deployment.id;
    const deploymentId = subdomain; // TODO: Add proper mapping from subdomain to deployment ID in DB instead of assuming they are the same

    // 3. Resolve file path
    let filePath = req.path;
    if (filePath === "/" || filePath === "") {
      filePath = "/index.html";
    }

    let key = `deployments/${deploymentId}${filePath}`;

    let s3Object;

    try {
      // Try to get the requested file
      const command = new GetObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key,
      });
      s3Object = await s3.send(command);
    } catch (err: any) {
      // SPA fallback - try index.html
      if (err.name === "NoSuchKey" || err.$metadata?.httpStatusCode === 404) {
        key = `deployments/${deploymentId}/index.html`;

        try {
          const fallbackCommand = new GetObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: key,
          });
          s3Object = await s3.send(fallbackCommand);
        } catch (fallbackErr) {
          res.status(404).send("File not found");
          return;
        }
      } else {
        throw err;
      }
    }

    // 4. Set Content-Type
    const contentType = mime.lookup(key) || "application/octet-stream";
    res.setHeader("Content-Type", contentType);

    // 5. Stream the file body
    if (s3Object.Body) {
      // Convert the SDK stream to a Node.js stream
      const nodeStream = sdkStreamMixin(s3Object.Body);
      nodeStream.pipe(res);
    } else {
      res.status(500).send("Failed to read file from S3");
    }
  } catch (err) {
    console.error("[Deployment Handler] Error:", err);
    res.status(500).send("Server error");
  }
}
