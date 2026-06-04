import { describe, it, expect } from "vitest";
import { successResponse, errorResponse } from "../src/utils/response.js";

describe("Unified Response Utilities", () => {
  it("should format a success response correctly", () => {
    const traceId = "test-trace-123";
    const data = { user: "Vinayak", role: "Admin" };

    const result = successResponse(traceId, data);

    expect(result).toEqual({
      traceId: "test-trace-123",
      success: true,
      data: { user: "Vinayak", role: "Admin" },
    });
  });

  it("should format an error response correctly", () => {
    const traceId = "test-trace-456";
    const result = errorResponse(
      traceId,
      "VALIDATION_ERROR",
      "Missing required fields",
    );

    expect(result).toEqual({
      traceId: "test-trace-456",
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Missing required fields",
      },
    });
  });
});
