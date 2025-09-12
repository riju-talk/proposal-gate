// server/db.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import 'dotenv/config'

const connectionString = process.env.DATABASE_URL;

let client: ReturnType<typeof postgres> | undefined;
let dbInstance: ReturnType<typeof drizzle> | undefined;

if (!connectionString) {
  // Allow server to boot even if DB isn't configured; API calls using db will fail at runtime
  console.warn(
    "[db] WARNING: DATABASE_URL is not set. The API server will start, but any endpoint that accesses the database will fail. Set DATABASE_URL in your environment to enable database access."
  );
} else {
  client = postgres(connectionString);
  dbInstance = drizzle(client);
  console.log("[db] Database connection initialized");
}

export const db = dbInstance as any;