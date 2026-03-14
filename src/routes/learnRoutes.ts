import { Router } from "express";
import { askLearnHandler, getLearnContentHandler } from "../controllers/learnController";

const router = Router();

router.get("/", getLearnContentHandler);
router.post("/ask", askLearnHandler);

export default router;

