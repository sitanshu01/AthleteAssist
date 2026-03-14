import { Router } from "express";
import { getWarmupsHandler } from "../controllers/warmupController";

const router = Router();

router.get("/", getWarmupsHandler);

export default router;

