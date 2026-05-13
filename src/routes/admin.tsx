import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftRight, Inbox, List, PieChart as PieIcon, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { StatsCards } from "@/components/StatsCards";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AdminDonasi } from "@/components/admin/AdminDonasi";
import { AdminMasuk } from "@/components/admin/AdminMasuk";
import { AdminTransaksi } from "@/components/admin/AdminTransaksi";
import { AdminSeksi } from "@/components/admin/AdminSeksi";
import { AdminGrafik } from "@/components/admin/AdminGrafik";
import type { Sumber, Seksi, Trx } from "@/lib/admin-types";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Panel Admin — Kholwat MDTI 2026" }] }),
  component: AdminPage,
});

async function fetchAdmin() {
  const [s, k, t] = await Promise.all([
    supabase.from("sumber_donasi").select("id, nama, urutan").order("urutan"),
    supabase.from("seksi").select("id, nama, rencana_anggaran, urutan").order("urutan"),
    supabase.from("transaksi").select("*").order("tanggal", { ascending: false }),
  ]);
  return {
    sumber: (s.data ?? []) as Sumber[],
    seksi: (k.data ?? []) as Seksi[],
    trx: (t.data ?? []) as Trx[],
  };
}

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        navigate({ to: "/login" });
        return;
      }
      const uid = sess.session.user.id;
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", uid);
      setIsAdmin((roles ?? []).some((r) => r.role === "admin"));
      setReady(true);
    })();
  }, [navigate]);

  const { data } = useQuery({
    queryKey: ["admin"],
    queryFn: fetchAdmin,
    enabled: ready && isAdmin,
  });
  const sumber = useMemo(() => data?.sumber ?? [], [data?.sumber]);
  const seksi = useMemo(() => data?.seksi ?? [], [data?.seksi]);
  const trx = useMemo(() => data?.trx ?? [], [data?.trx]);

  const reload = () => qc.invalidateQueries({ queryKey: ["admin"] });

  const { target, realisasi } = useMemo(() => {
    const target = seksi.reduce((a, s) => a + Number(s.rencana_anggaran), 0);
    const realisasi = trx
      .filter((t) => t.tipe === "pemasukan" && t.status === "diterima")
      .reduce((a, t) => a + Number(t.nominal), 0);
    return { target, realisasi };
  }, [seksi, trx]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <p className="p-10 text-center text-muted-foreground">Memuat...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-md px-4 py-10 text-center">
          <h1 className="mb-2 text-xl font-bold">Akses Ditolak</h1>
          <p className="mb-4 text-muted-foreground">Akun Anda tidak memiliki peran admin.</p>
          <Button onClick={() => navigate({ to: "/" })}>Kembali ke Beranda</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl space-y-5 px-4 py-6">
        <h1 className="text-2xl font-bold">Panel Admin</h1>
        <StatsCards target={target} realisasi={realisasi} />

        <Tabs defaultValue="donasi" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="donasi">
              <List className="mr-1 h-4 w-4" />
              Donasi
            </TabsTrigger>
            <TabsTrigger value="seksi">
              <Users className="mr-1 h-4 w-4" />
              Seksi
            </TabsTrigger>
            <TabsTrigger value="transaksi">
              <ArrowLeftRight className="mr-1 h-4 w-4" />
              Transaksi
            </TabsTrigger>
            <TabsTrigger value="grafik">
              <PieIcon className="mr-1 h-4 w-4" />
              Grafik
            </TabsTrigger>
            <TabsTrigger value="masuk">
              <Inbox className="mr-1 h-4 w-4" />
              Masuk
            </TabsTrigger>
          </TabsList>
          <TabsContent value="donasi" className="mt-4">
            <AdminDonasi sumber={sumber} trx={trx} onChanged={reload} />
          </TabsContent>
          <TabsContent value="seksi" className="mt-4">
            <AdminSeksi seksi={seksi} trx={trx} masuk={realisasi} onChanged={reload} />
          </TabsContent>
          <TabsContent value="transaksi" className="mt-4">
            <AdminTransaksi sumber={sumber} seksi={seksi} trx={trx} onChanged={reload} />
          </TabsContent>
          <TabsContent value="grafik" className="mt-4">
            <AdminGrafik sumber={sumber} seksi={seksi} trx={trx} />
          </TabsContent>
          <TabsContent value="masuk" className="mt-4">
            <AdminMasuk sumber={sumber} seksi={seksi} trx={trx} onChanged={reload} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
