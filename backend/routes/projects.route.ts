import express from "express";
import {
  createProjectController,
  getProjectsController,
  getProjectByIdController,
  getProjectByNameController,
  updateProjectController,
  addProjectDomainController,
  addProjectEnvVarController,
  deleteProjectEnvVarController,
  getProjectEnvVarsController,
  updateProjectDomainController,
  updateProjectEnvVarController,
} from "../controllers/project.controller";
import { requireAuth } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", requireAuth, getProjectsController);
router.post("/", requireAuth, createProjectController);
router.get("/name/:name", requireAuth, getProjectByNameController);
router.put("/name/:name", requireAuth, updateProjectController);
router.get("/name/:name/env-vars", requireAuth, getProjectEnvVarsController);
router.post("/name/:name/domains", requireAuth, addProjectDomainController);
router.put(
  "/name/:name/domains/:domainId",
  requireAuth,
  updateProjectDomainController,
);
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
