import { Router } from "express";
import {
  createActionItem,
  updateActionItemStatus,
  listActionItems,
  listOverdueActionItems,
} from "../controllers/actionItem.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

// Secure all action item endpoints
router.use(authenticateToken);

router.post("/", createActionItem);
router.get("/", listActionItems);
router.get("/overdue", listOverdueActionItems);
router.patch("/:id/status", updateActionItemStatus);

export default router;
