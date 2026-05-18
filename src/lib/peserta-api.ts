import { createServerFn } from "@tanstack/react-start";
import { Client } from "pg";

function getClient() {
  return new Client({
    connectionString:
      "postgresql://neondb_owner:npg_OJFXVAkB5ta7@ep-frosty-rain-a15zlmc8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  });
}

export const getPesertaList = createServerFn({ method: "GET" }).handler(async () => {
  const client = getClient();
  await client.connect();
  const res = await client.query("SELECT * FROM peserta ORDER BY created_at DESC");
  await client.end();
  return res.rows;
});

export const addPeserta = createServerFn({ method: "POST" })
  .validator(
    (data: { nama: string; jenis_kelamin: string; sumber_donasi_id?: string; no_wa?: string }) =>
      data,
  )
  .handler(async ({ data }) => {
    const client = getClient();
    await client.connect();
    const res = await client.query(
      "INSERT INTO peserta (nama, jenis_kelamin, sumber_donasi_id, no_wa) VALUES ($1, $2, $3, $4) RETURNING *",
      [data.nama, data.jenis_kelamin, data.sumber_donasi_id || null, data.no_wa || null],
    );
    await client.end();
    return res.rows[0];
  });

export const deletePeserta = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const client = getClient();
    await client.connect();
    await client.query("DELETE FROM peserta WHERE id = $1", [id]);
    await client.end();
    return true;
  });

export const addTransaksiPeserta = createServerFn({ method: "POST" })
  .validator((data: { transaksi_id: string; peserta_id: string }[]) => data)
  .handler(async ({ data }) => {
    const client = getClient();
    await client.connect();
    for (const row of data) {
      await client.query(
        "INSERT INTO transaksi_peserta (transaksi_id, peserta_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [row.transaksi_id, row.peserta_id],
      );
    }
    await client.end();
    return true;
  });
