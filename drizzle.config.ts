import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
// Load .env.local if present, fall back to .env
dotenv.config({ path: ".env.local" });
dotenv.config();

export default {
  driver: "pg",
  schema: "./src/lib/db/schema.ts",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;

// npx drizzle-kit push:pg
