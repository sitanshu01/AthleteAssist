import { Router } from "express";
import { getRulesHandler } from "../controllers/ruleController";

const router = Router();

router.get("/", getRulesHandler);

export default router;

