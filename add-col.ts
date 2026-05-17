import { Client } from 'pg';

async function check() {
    const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_OJFXVAkB5ta7@ep-frosty-rain-a15zlmc8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
    const client = new Client({ connectionString });
    try {
        await client.connect();
        
        await client.query(`
            ALTER TABLE transaksi 
            ADD COLUMN IF NOT EXISTS jumlah_pria INT DEFAULT 0,
            ADD COLUMN IF NOT EXISTS jumlah_wanita INT DEFAULT 0;
        `);
        console.log("Columns added successfully.");

        // also update supabase definition if we can, but we can't. Wait, supabase URL was used to query. Are they using Neon DB or Supabase DB?
        // Let's check where Supabase fetches data from... oh, Supabase fetches from its own DB. 
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}
check();
