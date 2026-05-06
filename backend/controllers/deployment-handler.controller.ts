import { GetObjectCommand } from "@aws-sdk/client-s3";
import { sdkStreamMixin } from "@aws-sdk/util-stream-node";
import { Request, Response } from "express";
import mime from "mime-types";
import { s3 } from "../utils/uploadToS3";

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

    // TODO: Add proper mapping from subdomain to deployment ID in DB instead of assuming they are the same
    const deploymentId = subdomain;
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
