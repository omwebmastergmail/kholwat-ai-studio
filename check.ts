import { Client } from 'pg';

async function check() {
    const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_OJFXVAkB5ta7@ep-frosty-rain-a15zlmc8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
    const client = new Client({ connectionString });
    try {
        await client.connect();
        const res = await client.query('SELECT COUNT(*) FROM sumber_donasi');
        console.log("Sumber Donasi count:", res.rows[0].count);
        const res2 = await client.query('SELECT COUNT(*) FROM seksi');
        console.log("Seksi count:", res2.rows[0].count);
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}
check();
