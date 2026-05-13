import pg from "pg";
const { Client } = pg;
const client = new Client({
  connectionString:
    "postgresql://neondb_owner:npg_OJFXVAkB5ta7@ep-frosty-rain-a15zlmc8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
});
async function run() {
  await client.connect();
  const res = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public';",
  );
  console.log(res.rows);
  await client.end();
}
run();
