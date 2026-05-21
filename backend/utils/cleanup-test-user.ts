import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function cleanup() {
  const email = "test@gmail.com";
  try {
    const { prisma } = await import("../lib/prisma");

    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (user) {
      await prisma.user.delete({
        where: { email },
      });
      console.log(`Successfully deleted test user ${email} and all cascaded projects/deployments.`);
    } else {
      console.log(`Test user ${email} does not exist. DB is clean.`);
    }
  } catch (error) {
    console.error("Error during database cleanup:", error);
    process.exit(1);
  }
}

cleanup();
