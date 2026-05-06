import express from "express";
import {
  createProjectController,
  getProjectsController,
  getProjectByIdController,
  getProjectByNameController,
} from "../controllers/project.controller";
import { requireAuth } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", requireAuth, getProjectsController);
router.post("/", requireAuth, createProjectController);
router.get("/:id", requireAuth, getProjectByIdController);
router.get("/name/:name", requireAuth, getProjectByNameController);

export default router;
