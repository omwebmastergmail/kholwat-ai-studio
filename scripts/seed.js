import pg from "pg";
const { Client } = pg;

const client = new Client({
  connectionString:
    "postgresql://neondb_owner:npg_OJFXVAkB5ta7@ep-frosty-rain-a15zlmc8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
});

async function run() {
  await client.connect();
  const res = await client.query("SELECT * FROM sumber_donasi LIMIT 1");
  console.log(res.rows);
  const info = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'sumber_donasi';
  `);
  console.log(info.rows);
  await client.end();
}

run();
