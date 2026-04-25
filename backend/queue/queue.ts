import { prisma } from "../lib/prisma";
import { DeploymentStatus } from "@prisma/client";

export async function pop() {
  const job = await prisma.deployment.findFirst({
    where: { status: DeploymentStatus.QUEUED },
    orderBy: { createdAt: "asc" },
  });

  if (job) {
    return job;
  }
  return undefined;
}
