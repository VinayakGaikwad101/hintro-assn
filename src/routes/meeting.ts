import { Router } from "express";
import {
  createMeeting,
  getMeeting,
  listMeetings,
} from "../controllers/meeting.js";
import { authenticateToken } from "../middleware/auth.js";
import { analyzeMeeting } from "../controllers/analysis.js";

const router = Router();

// Apply the auth middleware to ALL meeting routes
router.use(authenticateToken);

router.post("/", createMeeting);
router.get("/", listMeetings);
router.get("/:id", getMeeting);
router.post("/:id/analyze", analyzeMeeting);

export default router;
