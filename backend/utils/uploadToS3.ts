// @ts-ignore
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import fs from "fs";
import mime from "mime-types";
import path from "path";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

const S3_BUCKET_NAME = process.env.S3_BUCKET;

export async function uploadDirectoryToS3(
  localDirPath: string,
  s3Prefix: string,
) {
  const files = getAllFiles(localDirPath);

  const uploadPromises = files.map(async (filePath) => {
    const relativePath = path.relative(localDirPath, filePath);
    // S3 uses forward slashes for keys
    const s3Key = path.join(s3Prefix, relativePath).replace(/\\/g, "/");
    const contentType = mime.lookup(filePath) || "application/octet-stream";

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: s3Key,
      Body: fs.createReadStream(filePath),
      ContentType: contentType,
    });

    try {
      await s3.send(command);
      console.log(`[S3 Upload] Uploaded ${s3Key}`);
    } catch (error) {
      console.error(`[S3 Upload] Failed to upload ${s3Key}:`, error);
      throw error;
    }
  });

  await Promise.all(uploadPromises);
}

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}
