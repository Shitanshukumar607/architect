import express from "express";
import {
  createProjectController,
  getProjectsController,
} from "../controllers/project.controller";
import { requireAuth } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", requireAuth, getProjectsController);
router.post("/", requireAuth, createProjectController);

export default router;
