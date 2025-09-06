// server/db.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import 'dotenv/config'

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}


const client = postgres(connectionString);
console.log("Database is connected...")
export const db = drizzle(client);