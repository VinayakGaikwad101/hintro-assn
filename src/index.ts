import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import { traceMiddleware } from "./middleware/trace.js";
import { successResponse, errorResponse } from "./utils/response.js";
import cors from "cors";

// Swagger Imports
import swaggerUi from "swagger-ui-express";
import fs from "fs";

// Route Imports
import actionItemRoutes from "./routes/actionItem.js";
import authRoutes from "./routes/auth.js";
import meetingRoutes from "./routes/meeting.js";

// Service Imports
import { initScheduler } from "./services/scheduler.js";

// Safely load the Swagger JSON file in an ES Module environment
const swaggerDocument = JSON.parse(
  fs.readFileSync(new URL("../swagger.json", import.meta.url), "utf-8"),
);

const app = express();
const PORT = process.env.PORT || 3000;

// Global Middleware
app.use(cors()); // CORS enabled for all origins
app.use(express.json());
app.use(traceMiddleware);

// Swagger Documentation Route (Publicly accessible)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Modular Routes
app.use("/api", authRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/action-items", actionItemRoutes);

// Health Endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json(successResponse(req.traceId, { status: "UP" }));
});

// Evaluation Endpoint
app.get("/api/evaluation", (req: Request, res: Response) => {
  res.json({
    candidateName: "Vinayak Vishwanath Gaikwad",
    email: "vinaayakgaikwad@gmail.com",
    repositoryUrl: "https://github.com/VinayakGaikwad101/hintro-assn.git",
    deployedUrl: "https://hintro-assn.onrender.com",
    externalIntegration: "Discord Webhook",
    features: [
      "Authentication",
      "AI Analysis",
      "Reminder Scheduler",
      "Swagger API Documentation",
      "Global Error Handling",
      "Pagination & Filtering",
    ],
  });
});

// Initialize the background cron job for overdue action items
initScheduler();

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================
// This must be the absolute last app.use() before app.listen
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`[${req.traceId}] Unhandled Error:`, err);

  // Prevent server crashes from malformed JSON in the request body
  if (err instanceof SyntaxError && "body" in err) {
    return res
      .status(400)
      .json(
        errorResponse(
          req.traceId,
          "MALFORMED_REQUEST",
          "Invalid JSON payload format",
        ),
      );
  }

  // Catch-all for any other unexpected server crashes
  res
    .status(500)
    .json(
      errorResponse(
        req.traceId,
        "INTERNAL_SERVER_ERROR",
        "An unexpected error occurred",
      ),
    );
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(
    `API Documentation available at http://localhost:${PORT}/api-docs`,
  );
});
