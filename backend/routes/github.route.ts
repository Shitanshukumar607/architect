import express from "express";
import { getGitHubReposController } from "../controllers/github.controller";
import { requireAuth } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/repos", requireAuth, getGitHubReposController);

export default router;
