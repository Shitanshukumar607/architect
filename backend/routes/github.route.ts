import express from "express";
import {
  getGitHubReposController,
  githubWebhookController,
} from "../controllers/github.controller";
import { requireAuth } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/repos", requireAuth, getGitHubReposController);
router.post("/webhook", githubWebhookController);

export default router;
