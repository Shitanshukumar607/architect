import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import deployRoutes from "./routes/deploy.route";
import projectRoutes from "./routes/projects.route";
import { deploymentHandlerController } from "./controllers/deployment-handler.controller";
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

app.use("/api/deploy", deployRoutes);
app.use("/api/projects", projectRoutes);

app.get("/health", (req, res) => {
  res.send("OK");
});

// Catch-all handler for serving deployed projects
// IMPORTANT: This must be at the VERY END after all API routes
app.get(/.*/, deploymentHandlerController);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  startWorker();
});
