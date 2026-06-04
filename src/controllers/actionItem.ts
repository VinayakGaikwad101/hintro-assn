import { Request, Response } from "express";
import { sql } from "../db/index.js";
import { successResponse, errorResponse } from "../utils/response.js";

// POST /api/action-items
export const createActionItem = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { meetingId, task, assignee, dueDate } = req.body;

    if (!task || !assignee || !dueDate) {
      return res
        .status(400)
        .json(
          errorResponse(
            req.traceId,
            "VALIDATION_ERROR",
            "Missing required fields",
          ),
        );
    }

    const [newItem] = await sql`
      INSERT INTO action_items (meeting_id, task, assignee, due_date, status)
      VALUES (${meetingId || null}, ${task}, ${assignee}, ${new Date(dueDate)}, 'PENDING')
      RETURNING *
    `;

    return res.status(201).json(successResponse(req.traceId, newItem));
  } catch (error) {
    console.error(`[${req.traceId}] Create Action Item Error:`, error);
    return res
      .status(500)
      .json(
        errorResponse(
          req.traceId,
          "INTERNAL_SERVER_ERROR",
          "Failed to create action item",
        ),
      );
  }
};

// PATCH /api/action-items/:id/status
export const updateActionItemStatus = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["PENDING", "IN PROGRESS", "COMPLETED"];
    if (!status || !validStatuses.includes(status.toUpperCase())) {
      return res
        .status(400)
        .json(
          errorResponse(
            req.traceId,
            "VALIDATION_ERROR",
            "Invalid status update value",
          ),
        );
    }

    const [updatedItem] = await sql`
      UPDATE action_items
      SET status = ${status.toUpperCase()}
      WHERE id = ${id}::uuid
      RETURNING *
    `;

    if (!updatedItem) {
      return res
        .status(404)
        .json(errorResponse(req.traceId, "NOT_FOUND", "Action item not found"));
    }

    return res.status(200).json(successResponse(req.traceId, updatedItem));
  } catch (error) {
    console.error(`[${req.traceId}] Update Status Error:`, error);
    return res
      .status(500)
      .json(
        errorResponse(
          req.traceId,
          "INTERNAL_SERVER_ERROR",
          "Failed to update status",
        ),
      );
  }
};

// GET /api/action-items (With Multi-Filter Support)
export const listActionItems = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { status, assignee, meetingId } = req.query;

    const items = await sql`
      SELECT * FROM action_items
      WHERE 1=1
      ${status ? sql`AND status = ${status.toString().toUpperCase()}` : sql``}
      ${assignee ? sql`AND assignee ILIKE ${"%" + assignee.toString() + "%"}` : sql``}
      ${meetingId ? sql`AND meeting_id = ${meetingId.toString()}::uuid` : sql``}
      ORDER BY due_date ASC
    `;

    return res.status(200).json(successResponse(req.traceId, items));
  } catch (error) {
    console.error(`[${req.traceId}] List Action Items Error:`, error);
    return res
      .status(500)
      .json(
        errorResponse(
          req.traceId,
          "INTERNAL_SERVER_ERROR",
          "Failed to list items",
        ),
      );
  }
};

// GET /api/action-items/overdue
export const listOverdueActionItems = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const now = new Date();

    const overdueItems = await sql`
      SELECT * FROM action_items
      WHERE status != 'COMPLETED'
      AND due_date < ${now}
      ORDER BY due_date ASC
    `;

    return res.status(200).json(successResponse(req.traceId, overdueItems));
  } catch (error) {
    console.error(`[${req.traceId}] Overdue Detection Error:`, error);
    return res
      .status(500)
      .json(
        errorResponse(
          req.traceId,
          "INTERNAL_SERVER_ERROR",
          "Failed to check overdue items",
        ),
      );
  }
};
