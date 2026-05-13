
-- Roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "user_roles select own" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Sumber donasi
CREATE TABLE public.sumber_donasi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL UNIQUE,
  urutan INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sumber_donasi ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sumber_donasi public read" ON public.sumber_donasi FOR SELECT USING (true);
CREATE POLICY "sumber_donasi admin insert" ON public.sumber_donasi FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "sumber_donasi admin update" ON public.sumber_donasi FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "sumber_donasi admin delete" ON public.sumber_donasi FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- Seksi
CREATE TABLE public.seksi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL UNIQUE,
  rencana_anggaran NUMERIC(14,2) NOT NULL DEFAULT 0,
  urutan INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.seksi ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seksi public read" ON public.seksi FOR SELECT USING (true);
CREATE POLICY "seksi admin insert" ON public.seksi FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "seksi admin update" ON public.seksi FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "seksi admin delete" ON public.seksi FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- Transaksi
CREATE TYPE public.transaksi_tipe AS ENUM ('pemasukan','pengeluaran');

CREATE TABLE public.transaksi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  sumber_donasi_id UUID REFERENCES public.sumber_donasi(id) ON DELETE SET NULL,
  seksi_id UUID REFERENCES public.seksi(id) ON DELETE SET NULL,
  tipe transaksi_tipe NOT NULL DEFAULT 'pemasukan',
  nominal NUMERIC(14,2) NOT NULL DEFAULT 0,
  keterangan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transaksi ENABLE ROW LEVEL SECURITY;
CREATE POLICY "transaksi public read" ON public.transaksi FOR SELECT USING (true);
CREATE POLICY "transaksi admin insert" ON public.transaksi FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "transaksi admin update" ON public.transaksi FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "transaksi admin delete" ON public.transaksi FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
