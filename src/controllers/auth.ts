import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sql } from "../db/index.js";
import { successResponse, errorResponse } from "../utils/response.js";

const JWT_SECRET = process.env.JWT_SECRET!;

export const signup = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json(
          errorResponse(
            req.traceId,
            "VALIDATION_ERROR",
            "Email and password are required",
          ),
        );
    }

    const existingUser = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existingUser.length > 0) {
      return res
        .status(400)
        .json(errorResponse(req.traceId, "CONFLICT", "User already exists"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await sql`
      INSERT INTO users (email, password) 
      VALUES (${email}, ${hashedPassword}) 
      RETURNING id, email, created_at
    `;

    return res.status(201).json(successResponse(req.traceId, newUser));
  } catch (error) {
    console.error(`[${req.traceId}] Signup Error:`, error);
    return res
      .status(500)
      .json(
        errorResponse(req.traceId, "INTERNAL_SERVER_ERROR", "Signup failed"),
      );
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json(
          errorResponse(
            req.traceId,
            "VALIDATION_ERROR",
            "Email and password are required",
          ),
        );
    }

    const [user] = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (!user) {
      return res
        .status(401)
        .json(
          errorResponse(req.traceId, "UNAUTHORIZED", "Invalid credentials"),
        );
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res
        .status(401)
        .json(
          errorResponse(req.traceId, "UNAUTHORIZED", "Invalid credentials"),
        );
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "24h",
    });

    return res.status(200).json(successResponse(req.traceId, { token }));
  } catch (error) {
    console.error(`[${req.traceId}] Login Error:`, error);
    return res
      .status(500)
      .json(
        errorResponse(req.traceId, "INTERNAL_SERVER_ERROR", "Login failed"),
      );
  }
};
