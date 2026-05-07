import { GetObjectCommand } from "@aws-sdk/client-s3";
import { sdkStreamMixin } from "@aws-sdk/util-stream-node";
import { Request, Response } from "express";
import mime from "mime-types";
import { s3 } from "../utils/uploadToS3";
import { prisma } from "../lib/prisma";

const S3_BUCKET_NAME = process.env.S3_BUCKET || "architect-deployments";

const resolveFilePath = (path: string): string => {
  return path === "/" || path === "" ? "/index.html" : path;
};

const fetchFromS3 = async (deploymentId: string, filePath: string) => {
  let key = `deployments/${deploymentId}${filePath}`;

  try {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    });

    return {
      ObjectContent: await s3.send(command),
      finalKey: key,
    };
  } catch (err: any) {
    // SPA fallback - try index.html
    if (err.name === "NoSuchKey" || err.$metadata?.httpStatusCode === 404) {
      key = `deployments/${deploymentId}/index.html`;
      const fallbackCommand = new GetObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key,
      });

      return {
        ObjectContent: await s3.send(fallbackCommand),
        finalKey: key,
      };
    }
    throw err;
  }
};

async function getDeploymentIdFromHost(host: string): Promise<string | null> {
  // 1. Clean host (remove port)
  const hostname = host.split(":")[0];

  // 2. Try to find a custom domain
  const domain = await prisma.projectDomain.findUnique({
    where: { hostname },
    include: {
      project: {
        include: {
          deployments: {
            where: { status: "SUCCESS" },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  if (domain && domain.project.deployments.length > 0) {
    return domain.project.deployments[0].id;
  }

  // 3. Handle subdomains (e.g., project-name.architect.com or deployment-id.architect.com)
  const parts = hostname.split(".");
  if (parts.length >= 2 || hostname.includes("localhost")) {
    const subdomain = parts[0];

    // Check if it's a deployment ID
    const deployment = await prisma.deployment.findUnique({
      where: { id: subdomain },
    });
    if (deployment) return deployment.id;

    // Check if it's a project name
    const project = await prisma.project.findFirst({
      where: { name: subdomain },
      include: {
        deployments: {
          where: { status: "SUCCESS" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (project && project.deployments.length > 0) {
      return project.deployments[0].id;
    }
  }

  return null;
}

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

    const deploymentId = await getDeploymentIdFromHost(host);

    if (!deploymentId) {
      res.status(404).send("Deployment not found");
      return;
    }

    const filePath = resolveFilePath(req.path);

    try {
      const { ObjectContent, finalKey } = await fetchFromS3(
        deploymentId,
        filePath,
      );

      const contentType = mime.lookup(finalKey) || "application/octet-stream";
      res.setHeader("Content-Type", contentType);

      if (ObjectContent.Body) {
        const nodeStream = sdkStreamMixin(ObjectContent.Body);
        nodeStream.pipe(res);
      } else {
        res.status(500).send("Failed to read file from S3");
      }
    } catch (s3Error: any) {
      if (
        s3Error.name === "NoSuchKey" ||
        s3Error.$metadata?.httpStatusCode === 404
      ) {
        res.status(404).send("File not found");
      } else {
        throw s3Error;
      }
    }
  } catch (err) {
    console.error("[Deployment Handler] Error:", err);
    res.status(500).send("Server error");
  }
}
