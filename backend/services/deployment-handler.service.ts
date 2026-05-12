import { GetObjectCommand } from "@aws-sdk/client-s3";
import { sdkStreamMixin } from "@aws-sdk/util-stream-node";
import mime from "mime-types";
import {
  findDeploymentByIdOnly,
  findLatestSuccessfulDeploymentByDomain,
  findLatestSuccessfulDeploymentByProjectName,
} from "../models/deploymentModel";
import { s3 } from "../utils/uploadToS3";
import { ServiceError } from "./service-error";

const S3_BUCKET_NAME = process.env.S3_BUCKET || "architect-deployments";

function resolveFilePath(requestPath: string): string {
  return requestPath === "/" || requestPath === ""
    ? "/index.html"
    : requestPath;
}

function isNotFoundError(error: any): boolean {
  return (
    error?.name === "NoSuchKey" || error?.$metadata?.httpStatusCode === 404
  );
}

async function fetchFromS3(deploymentId: string, filePath: string) {
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
  } catch (error: any) {
    if (!isNotFoundError(error)) {
      throw error;
    }

    key = `deployments/${deploymentId}/index.html`;
    const fallbackCommand = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    });

    try {
      return {
        ObjectContent: await s3.send(fallbackCommand),
        finalKey: key,
      };
    } catch (fallbackError: any) {
      if (isNotFoundError(fallbackError)) {
        throw new ServiceError("File not found", 404);
      }
      throw fallbackError;
    }
  }
}

async function getDeploymentIdFromHost(host: string): Promise<string | null> {
  const hostname = host.split(":")[0];

  const domainDeployment =
    await findLatestSuccessfulDeploymentByDomain(hostname);
  if (domainDeployment) {
    return domainDeployment.id;
  }

  const parts = hostname.split(".");
  if (parts.length >= 2 || hostname.includes("localhost")) {
    const subdomain = parts[0];

    const deployment = await findDeploymentByIdOnly(subdomain);
    if (deployment) {
      return deployment.id;
    }

    const projectDeployment =
      await findLatestSuccessfulDeploymentByProjectName(subdomain);
    if (projectDeployment) {
      return projectDeployment.id;
    }
  }

  return null;
}

type DeploymentAssetResponse = {
  contentType: string;
  stream: NodeJS.ReadableStream;
};

export async function getDeploymentAssetStream(
  host: string,
  requestPath: string,
): Promise<DeploymentAssetResponse> {
  const deploymentId = await getDeploymentIdFromHost(host);

  if (!deploymentId) {
    throw new ServiceError("Deployment not found", 404);
  }

  const filePath = resolveFilePath(requestPath);
  const { ObjectContent, finalKey } = await fetchFromS3(deploymentId, filePath);

  const contentType = mime.lookup(finalKey) || "application/octet-stream";

  if (!ObjectContent.Body) {
    throw new ServiceError("Failed to read file from S3", 500);
  }

  const nodeStream = sdkStreamMixin(ObjectContent.Body);

  return {
    contentType,
    stream: nodeStream,
  };
}
