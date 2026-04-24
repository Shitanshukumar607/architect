import express from "express";
import {
  createDeploymentController,
  getDeploymentController,
} from "../controllers/deployController";
import { requireAuth } from "../middleware/authMiddleware";

const router = express.Router();

// All deploy routes require authentication
router.post("/", requireAuth, createDeploymentController);
router.get("/:id", requireAuth, getDeploymentController);

export default router;
