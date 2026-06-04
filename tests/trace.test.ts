import { describe, it, expect, vi } from "vitest";
import { traceMiddleware } from "../src/middleware/trace.js";
import { Request, Response, NextFunction } from "express";

describe("Trace Middleware", () => {
  it("should generate a new traceId if one is not provided in headers", () => {
    const req = { headers: {} } as Request;
    // Mock the 'on' method since our middleware uses res.on('finish', ...)
    const res = { on: vi.fn() } as unknown as Response;
    const next = vi.fn() as NextFunction;

    traceMiddleware(req, res, next);

    expect(req.traceId).toBeDefined();
    expect(typeof req.traceId).toBe("string");
    expect(next).toHaveBeenCalledOnce();
  });

  it("should use the provided x-trace-id header if it exists", () => {
    const req = {
      headers: { "x-trace-id": "custom-client-id-999" },
    } as unknown as Request;
    const res = { on: vi.fn() } as unknown as Response;
    const next = vi.fn() as NextFunction;

    traceMiddleware(req, res, next);

    expect(req.traceId).toBe("custom-client-id-999");
    expect(next).toHaveBeenCalledOnce();
  });
});
