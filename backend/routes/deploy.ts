import express from "express";
import {
  createDeploymentController,
  getDeploymentController,
} from "../controllers/deployController";

const router = express.Router();

router.post("/", createDeploymentController);
router.get("/:id", getDeploymentController);

export default router;
