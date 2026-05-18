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

-- Turn on RLS
ALTER TABLE peserta ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaksi_peserta ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated/anon users (since this is an admin app without strict auth yet)
CREATE POLICY "Enable all ops for peserta" ON peserta FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all ops for transaksi_peserta" ON transaksi_peserta FOR ALL USING (true) WITH CHECK (true);
