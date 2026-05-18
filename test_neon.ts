import { Client } from 'pg';

async function main() {
  const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_OJFXVAkB5ta7@ep-frosty-rain-a15zlmc8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
  });
  await client.connect();
  const res = await client.query('SELECT count(*) FROM sumber_donasi');
  const trxRes = await client.query('SELECT count(*) FROM transaksi');
  console.log("sumber_donasi count:", res.rows[0].count);
  console.log("transaksi count:", trxRes.rows[0].count);
  await client.end();
}
main();
