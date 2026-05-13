
CREATE POLICY "transaksi public insert pending"
ON public.transaksi
FOR INSERT
TO anon, authenticated
WITH CHECK (tipe = 'pemasukan' AND status = 'pending' AND seksi_id IS NULL);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='bukti-bayar public upload') THEN
    CREATE POLICY "bukti-bayar public upload"
    ON storage.objects
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (bucket_id = 'bukti-bayar');
  END IF;
END $$;
