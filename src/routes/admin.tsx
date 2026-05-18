import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftRight, Inbox, List, PieChart as PieIcon, Users, UserRound } from "lucide-react";
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
import { AdminPeserta } from "@/components/admin/AdminPeserta";
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

        <Tabs defaultValue="donasi" className="flex w-full flex-col gap-6 md:flex-row">
          <TabsList className="flex h-auto w-full shrink-0 justify-start overflow-x-auto rounded-lg md:w-56 md:flex-col md:items-stretch md:justify-start md:space-y-1 md:bg-transparent md:p-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <TabsTrigger
              value="donasi"
              className="md:justify-start md:hover:bg-muted md:data-[state=active]:bg-primary/10 md:data-[state=active]:text-primary md:data-[state=active]:shadow-none"
            >
              <List className="mr-2 h-4 w-4 shrink-0" />
              Donasi
            </TabsTrigger>
            <TabsTrigger
              value="seksi"
              className="md:justify-start md:hover:bg-muted md:data-[state=active]:bg-primary/10 md:data-[state=active]:text-primary md:data-[state=active]:shadow-none"
            >
              <Users className="mr-2 h-4 w-4 shrink-0" />
              Seksi
            </TabsTrigger>
            <TabsTrigger
              value="transaksi"
              className="md:justify-start md:hover:bg-muted md:data-[state=active]:bg-primary/10 md:data-[state=active]:text-primary md:data-[state=active]:shadow-none"
            >
              <ArrowLeftRight className="mr-2 h-4 w-4 shrink-0" />
              Transaksi
            </TabsTrigger>
            <TabsTrigger
              value="peserta"
              className="md:justify-start md:hover:bg-muted md:data-[state=active]:bg-primary/10 md:data-[state=active]:text-primary md:data-[state=active]:shadow-none"
            >
              <UserRound className="mr-2 h-4 w-4 shrink-0" />
              Peserta
            </TabsTrigger>
            <TabsTrigger
              value="grafik"
              className="md:justify-start md:hover:bg-muted md:data-[state=active]:bg-primary/10 md:data-[state=active]:text-primary md:data-[state=active]:shadow-none"
            >
              <PieIcon className="mr-2 h-4 w-4 shrink-0" />
              Grafik
            </TabsTrigger>
            <TabsTrigger
              value="konfirmasi"
              className="md:justify-start md:hover:bg-muted md:data-[state=active]:bg-primary/10 md:data-[state=active]:text-primary md:data-[state=active]:shadow-none"
            >
              <Inbox className="mr-2 h-4 w-4 shrink-0" />
              Konfirmasi
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden min-w-0">
            <TabsContent value="donasi" className="mt-0">
              <AdminDonasi sumber={sumber} trx={trx} onChanged={reload} />
            </TabsContent>
            <TabsContent value="seksi" className="mt-0">
              <AdminSeksi seksi={seksi} trx={trx} masuk={realisasi} onChanged={reload} />
            </TabsContent>
            <TabsContent value="transaksi" className="mt-0">
              <AdminTransaksi sumber={sumber} seksi={seksi} trx={trx} onChanged={reload} />
            </TabsContent>
            <TabsContent value="peserta" className="mt-0">
              <AdminPeserta sumber={sumber} onChanged={reload} />
            </TabsContent>
            <TabsContent value="grafik" className="mt-0">
              <AdminGrafik sumber={sumber} seksi={seksi} trx={trx} />
            </TabsContent>
            <TabsContent value="konfirmasi" className="mt-0">
              <AdminMasuk sumber={sumber} seksi={seksi} trx={trx} onChanged={reload} />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}
