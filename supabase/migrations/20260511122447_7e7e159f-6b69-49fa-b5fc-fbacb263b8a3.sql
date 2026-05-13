
-- Add status enum for transaksi
DO $$ BEGIN
  CREATE TYPE public.transaksi_status AS ENUM ('pending','diterima','ditolak');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Add columns to transaksi
ALTER TABLE public.transaksi
  ADD COLUMN IF NOT EXISTS donor_nama TEXT,
  ADD COLUMN IF NOT EXISTS kode TEXT,
  ADD COLUMN IF NOT EXISTS status public.transaksi_status NOT NULL DEFAULT 'diterima',
  ADD COLUMN IF NOT EXISTS bukti_bayar_url TEXT;

CREATE INDEX IF NOT EXISTS idx_transaksi_status ON public.transaksi(status);
CREATE INDEX IF NOT EXISTS idx_transaksi_tipe ON public.transaksi(tipe);

-- Storage bucket for bukti bayar (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('bukti-bayar', 'bukti-bayar', true)
ON CONFLICT (id) DO NOTHING;

-- Public can read
DROP POLICY IF EXISTS "bukti-bayar public read" ON storage.objects;
CREATE POLICY "bukti-bayar public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'bukti-bayar');

-- Admin can upload
DROP POLICY IF EXISTS "bukti-bayar admin insert" ON storage.objects;
CREATE POLICY "bukti-bayar admin insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'bukti-bayar' AND public.has_role(auth.uid(), 'admin'));

-- Admin can update
DROP POLICY IF EXISTS "bukti-bayar admin update" ON storage.objects;
CREATE POLICY "bukti-bayar admin update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'bukti-bayar' AND public.has_role(auth.uid(), 'admin'));

-- Admin can delete
DROP POLICY IF EXISTS "bukti-bayar admin delete" ON storage.objects;
CREATE POLICY "bukti-bayar admin delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'bukti-bayar' AND public.has_role(auth.uid(), 'admin'));
