import { Router } from "express";
import { generateDietHandler, getDietHandler } from "../controllers/dietController";

const router = Router();

router.get("/:userId", getDietHandler);
router.post("/generate", generateDietHandler);

export default router;

