import express from "express";
import {
  createProjectController,
  getProjectsController,
  getProjectByIdController,
  getProjectByNameController,
  addProjectDomainController,
  addProjectEnvVarController,
  deleteProjectEnvVarController,
  getProjectEnvVarsController,
  updateProjectEnvVarController,
} from "../controllers/project.controller";
import { requireAuth } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", requireAuth, getProjectsController);
router.post("/", requireAuth, createProjectController);
router.get("/name/:name", requireAuth, getProjectByNameController);
router.get("/name/:name/env-vars", requireAuth, getProjectEnvVarsController);
router.post("/name/:name/domains", requireAuth, addProjectDomainController);
router.post("/name/:name/env-vars", requireAuth, addProjectEnvVarController);
router.put(
  "/name/:name/env-vars/:envVarId",
  requireAuth,
  updateProjectEnvVarController,
);
router.delete(
  "/name/:name/env-vars/:envVarId",
  requireAuth,
  deleteProjectEnvVarController,
);
router.get("/:id", requireAuth, getProjectByIdController);

export default router;
