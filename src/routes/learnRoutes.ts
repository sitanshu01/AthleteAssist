import { Router } from "express";
import { askLearnHandler, getLearnContentHandler } from "../controllers/learnController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.get("/", getLearnContentHandler);
router.post("/ask", authenticateToken, askLearnHandler);

export default router;

