import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import deployRoutes from "./routes/deploy.route";
import projectRoutes from "./routes/projects.route";
import { startWorker } from "./worker/worker";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);

// BetterAuth handler MUST be mounted BEFORE express.json()
app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use(express.json());

app.use("/deploy", deployRoutes);
app.use("/api/projects", projectRoutes);

app.get("/", (req, res) => {
  res.send("Server is running123!!!!!!");
});

app.get("/resolve", async (req, res) => {
  const host = req.headers.host;
  // const subdomain = host!.split(".")[0];

  // const record = await db.get(subdomain);
  const record = "test";

  if (!record) {
    return res.status(404).send("Not found");
  }

  return res.redirect(
    // `https://architect-by-shitanshu.s3.amazonaws.com/${record}/index.html`
    // `https://${process.env.S3_BUCKET}.s3.eu-north-1.amazonaws.com/deployments/${record}/index.html`,
    "google.com"
  );
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  startWorker();
});
