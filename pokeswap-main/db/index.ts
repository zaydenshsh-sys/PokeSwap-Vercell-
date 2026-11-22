
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema.js";

const connectionString = process.env.DATABASE_URL;

let databaseHost = "missing";
let databasePort = "unknown";

if (connectionString) {
  try {
    const parsed = new URL(connectionString);
    databaseHost = parsed.hostname;
    databasePort = parsed.port || "5432";
  } catch {
    databaseHost = "invalid connection string";
  }
}

console.log("[DATABASE DIAGNOSTIC]", {
  databaseUrlExists: Boolean(connectionString),
  databaseHost,
  databasePort,
});

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is required. Use your Supabase PostgreSQL connection string."
  );
}

// Supabase transaction pooler is recommended for serverless deployments.
const client = postgres(connectionString, {
  prepare: false,
  max: 1,
  idle_timeout: 20,
  connect_timeout: 15,
});

export const db = drizzle(client, { schema });
