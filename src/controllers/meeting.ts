import { Request, Response } from "express";
import { sql } from "../db/index.js";
import { successResponse, errorResponse } from "../utils/response.js";

// POST /api/meetings
export const createMeeting = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { title, participants, meetingDate, transcript } = req.body;

    // Strict Input Validation
    if (!title || !participants || !meetingDate || !transcript) {
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

    const [newMeeting] = await sql`
      INSERT INTO meetings (title, participants, meeting_date, transcript) 
      VALUES (
        ${title}, 
        ${JSON.stringify(participants)}::jsonb, 
        ${new Date(meetingDate)}, 
        ${JSON.stringify(transcript)}::jsonb
      ) 
      RETURNING *
    `;

    return res.status(201).json(successResponse(req.traceId, newMeeting));
  } catch (error) {
    console.error(`[${req.traceId}] Create Meeting Error:`, error);
    return res
      .status(500)
      .json(
        errorResponse(
          req.traceId,
          "INTERNAL_SERVER_ERROR",
          "Failed to save meeting",
        ),
      );
  }
};

// GET /api/meetings/:id
export const getMeeting = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const [meeting] = await sql`SELECT * FROM meetings WHERE id = ${id}::uuid`;

    if (!meeting) {
      return res
        .status(404)
        .json(errorResponse(req.traceId, "NOT_FOUND", "Meeting not found"));
    }

    return res.status(200).json(successResponse(req.traceId, meeting));
  } catch (error) {
    console.error(`[${req.traceId}] Get Meeting Error:`, error);
    return res
      .status(500)
      .json(
        errorResponse(
          req.traceId,
          "INTERNAL_SERVER_ERROR",
          "Failed to fetch meeting",
        ),
      );
  }
};

// GET /api/meetings (With Pagination)
export const listMeetings = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    // Safely parse pagination limits
    const page = parseInt(req.query.page?.toString() || "1");
    const limit = parseInt(req.query.limit?.toString() || "10");
    const offset = (page - 1) * limit;

    const meetings = await sql`
      SELECT * FROM meetings 
      ORDER BY meeting_date DESC 
      LIMIT ${limit} OFFSET ${offset}
    `;

    const [{ count }] = await sql`SELECT count(*) FROM meetings`;
    const total = parseInt(count);

    return res.status(200).json(
      successResponse(req.traceId, {
        meetings,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      }),
    );
  } catch (error) {
    console.error(`[${req.traceId}] List Meetings Error:`, error);
    return res
      .status(500)
      .json(
        errorResponse(
          req.traceId,
          "INTERNAL_SERVER_ERROR",
          "Failed to list meetings",
        ),
      );
  }
};
