import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

// Add traceId to the Express Request type globally
declare global {
  namespace Express {
    interface Request {
      traceId: string;
    }
  }
}

export const traceMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // 1. Generate trace ID if absent
  req.traceId = req.headers["x-trace-id"]?.toString() || uuidv4();

  // 2. Hook into the 'finish' event to log the request once the status code is known
  res.on("finish", () => {
    const timestamp = new Date().toISOString();

    // Structured Log: [Timestamp] [TraceID] Method Path - Status
    const logMessage = `[${timestamp}] [${req.traceId}] ${req.method} ${req.path} - ${res.statusCode}`;

    // If it's an error status, log it as an error for visibility
    if (res.statusCode >= 400) {
      console.error(logMessage);
    } else {
      console.log(logMessage);
    }
  });

  next();
};
