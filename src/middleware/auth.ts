import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { errorResponse } from "../utils/response.js";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-local-key";

// Extend Express Request to hold our user payload
declare global {
  namespace Express {
    interface Request {
      user?: any;
      traceId: string;
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Expects "Bearer <token>"

  if (!token) {
    res
      .status(401)
      .json(
        errorResponse(
          req.traceId,
          "UNAUTHORIZED",
          "Missing authentication token",
        ),
      );
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      res
        .status(403)
        .json(
          errorResponse(req.traceId, "FORBIDDEN", "Invalid or expired token"),
        );
      return;
    }

    req.user = user;
    next(); // Token is valid, proceed to the route
  });
};
