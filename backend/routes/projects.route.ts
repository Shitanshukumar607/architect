import express from "express";
import {
  createProjectController,
  getProjectsController,
  getProjectByIdController,
} from "../controllers/project.controller";
import { requireAuth } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", requireAuth, getProjectsController);
router.post("/", requireAuth, createProjectController);
router.get("/:id", requireAuth, getProjectByIdController);

export default router;
