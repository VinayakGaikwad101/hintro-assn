import "dotenv/config";
import { neon } from "@neondatabase/serverless";

// Fail fast if the environment variable is missing
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing in the .env file");
}

// Initialize and export the shared SQL client
export const sql = neon(process.env.DATABASE_URL);
