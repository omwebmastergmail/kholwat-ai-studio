import pg from "pg";

const client = new pg.Client({
  connectionString:
    "postgresql://neondb_owner:npg_OJFXVAkB5ta7@ep-frosty-rain-a15zlmc8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
});

const seed = [
  "BANDUNG",
  "BATANG",
  "Belum Konfirmasi",
  "BOJONEGORO 1 - KAPAS",
  "BOJONEGORO 2 - SEKAR",
  "CIREBON",
  "DEMAK 1 - WONOKETINGAL",
  "DEMAK 2 - DEMPET",
  "DEMAK 3 (MRANGGEN)",
  "GARUT",
  "GROBOGAN 1 - PURWODADI",
  "GROBOGAN 2 - GODONG",
  "JAKARTA SELATAN",
  "JAMBI",
  "JEPARA",
  "KENDAL 1 - CEPIRING",
  "KENDAL 2 - BOJA",
  "KENDAL BOTOMULYO",
  "KLATEN",
  "PALEMBANG - KOTA",
  "PALEMBANG - SEKAYU",
  "PEMALANG 1 - BELIK",
  "PEMALANG 2 - ULUJAMI",
  "PONOROGO",
  "PURWOREJO",
  "RIAU",
  "SEMARANG - CANDILAMA",
  "SEMARANG - GENUK",
  "SEMARANG - KROBOKAN",
  "SEMARANG - MIJEN",
  "SEMARANG - NGALIYAN",
  "SEMARANG - PEDURUNGAN",
  "SEMARANG - PUSAT",
  "SEMARANG KALICARI",
  "SOLO",
  "TANGERANG",
  "TEGAL 1 - KOTA",
  "TEGAL 2 - SLAWI",
  "TEGAL BARU",
  "TEMANGGUNG",
  "UNGARAN 1 - GOGIK",
  "UNGARAN 2 - JATIRUNGGO",
  "UNGARAN 3 - BABADAN",
  "YOGYAKARTA",
];

async function run() {
  await client.connect();
  console.log("Connected to Neon DB. Initializing schema...");

  try {
    await client.query(
      "DO $body$ BEGIN CREATE TYPE public.transaksi_tipe AS ENUM ('pemasukan','pengeluaran'); EXCEPTION WHEN duplicate_object THEN null; END $body$;",
    );
  } catch (e) {}

  await client.query(
    "CREATE TABLE IF NOT EXISTS sumber_donasi (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), nama TEXT NOT NULL UNIQUE, urutan INT NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT now());",
  );
  await client.query(
    "CREATE TABLE IF NOT EXISTS seksi (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), nama TEXT NOT NULL UNIQUE, rencana_anggaran NUMERIC(14,2) NOT NULL DEFAULT 0, urutan INT NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT now());",
  );
  await client.query(
    "CREATE TABLE IF NOT EXISTS transaksi (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), tanggal DATE NOT NULL DEFAULT CURRENT_DATE, sumber_donasi_id UUID REFERENCES sumber_donasi(id) ON DELETE SET NULL, seksi_id UUID REFERENCES seksi(id) ON DELETE SET NULL, tipe transaksi_tipe NOT NULL DEFAULT 'pemasukan', nominal NUMERIC(14,2) NOT NULL DEFAULT 0, keterangan TEXT, status TEXT DEFAULT 'diterima', created_at TIMESTAMPTZ NOT NULL DEFAULT now());",
  );

  console.log("Schema initialized. Seeding...");
  for (let i = 0; i < seed.length; i++) {
    const nama = seed[i];
    await client.query(
      "INSERT INTO sumber_donasi (nama, urutan) VALUES ($1, $2) ON CONFLICT (nama) DO UPDATE SET urutan = EXCLUDED.urutan",
      [nama, i + 1],
    );
  }

  console.log("Seeding complete!");
  const res = await client.query("SELECT * FROM sumber_donasi ORDER BY urutan");
  console.log("Count:", res.rows.length);
  await client.end();
}

run();
