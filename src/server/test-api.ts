import { createServerFn } from "@tanstack/react-start";
import { Client } from "pg";

export const getSumberDonasiFn = createServerFn({ method: "GET" }).handler(async () => {
    const client = new Client({
        connectionString: "postgresql://neondb_owner:npg_OJFXVAkB5ta7@ep-frosty-rain-a15zlmc8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    });
    await client.connect();
    const res = await client.query("SELECT count(*) FROM sumber_donasi");
    await client.end();
    return res.rows[0].count;
});
