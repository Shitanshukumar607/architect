import { prisma } from "../lib/prisma";
import { DeploymentStatus } from "@prisma/client";

export async function pop() {
  const job = await prisma.deployment.findFirst({
    where: { status: DeploymentStatus.QUEUED },
    orderBy: { createdAt: "asc" },
  });

  if (!job) {
    return undefined;
  }

  const updatedJob = await prisma.deployment.update({
    where: { id: job.id, status: DeploymentStatus.QUEUED },
    data: { status: DeploymentStatus.BUILDING },
  }).catch(() => null);

  return updatedJob || undefined;
}
