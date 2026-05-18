import { Client } from 'pg';

async function main() {
  const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_OJFXVAkB5ta7@ep-frosty-rain-a15zlmc8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
  });
  await client.connect();
  await client.query(`
    CREATE TABLE IF NOT EXISTS peserta (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      nama TEXT NOT NULL,
      jenis_kelamin TEXT,
      sumber_donasi_id UUID REFERENCES sumber_donasi(id),
      no_wa TEXT
    );
    
    CREATE TABLE IF NOT EXISTS transaksi_peserta (
      transaksi_id UUID REFERENCES transaksi(id) ON DELETE CASCADE,
      peserta_id UUID REFERENCES peserta(id) ON DELETE CASCADE,
      PRIMARY KEY (transaksi_id, peserta_id)
    );
  `);
  console.log('Tables created');
  await client.end();
}
main();
