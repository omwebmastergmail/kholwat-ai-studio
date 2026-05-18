import { Client } from 'pg';

async function main() {
  const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_OJFXVAkB5ta7@ep-frosty-rain-a15zlmc8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
  });
  await client.connect();
  const res = await client.query('SELECT * FROM sumber_donasi LIMIT 2');
  console.log(res.rows);
  await client.end();
}
main();
