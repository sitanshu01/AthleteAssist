import { Router } from "express";
import { getExercisesHandler } from "../controllers/exerciseController";

const router = Router();

router.get("/", getExercisesHandler);

export default router;

