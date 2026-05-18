import { Client } from "pg";
import * as fs from "fs";

async function seed() {
  const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_OJFXVAkB5ta7@ep-frosty-rain-a15zlmc8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

  if (!connectionString) {
    console.error("No database connection string provided.");
    return;
  }

  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log("Connected to the database. Running seed script...");
    const sql = fs.readFileSync("seed.sql", "utf8");
    await client.query(sql);
    console.log("Seed data applied successfully.");
  } catch (err) {
    console.error("Error applying seed data:", err);
  } finally {
    await client.end();
  }
}

seed();
