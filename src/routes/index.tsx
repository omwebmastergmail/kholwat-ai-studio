import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeftRight, FileText, List, PieChart as PieIcon, Users, Wallet } from "lucide-react";
import { Header } from "@/components/Header";
import { StatsCards } from "@/components/StatsCards";
import { DonasiTab, type SumberRow } from "@/components/DonasiTab";
import { SeksiTab, type SeksiRow } from "@/components/SeksiTab";
import { TransaksiTab, type TrxRow } from "@/components/TransaksiTab";
import { GrafikTab } from "@/components/GrafikTab";
import { SuratEdaranTab } from "@/components/SuratEdaranTab";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kholwat MDTI 2026 — Majelis Dzikir Tasbih Indonesia" },
      {
        name: "description",
        content:
          "Surat edaran dan laporan keuangan Kholwat MDTI 2026 — Majelis Dzikir Tasbih Indonesia. Pantau target, realisasi, dan kontribusi tiap sumber donasi.",
      },
      { property: "og:title", content: "Kholwat MDTI 2026" },
      {
        property: "og:description",
        content: "Surat edaran & laporan keuangan Kholwat 2026 Majelis Dzikir Tasbih Indonesia.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Dashboard,
});

async function fetchAll() {
  const [{ data: sumber }, { data: seksi }, { data: trx }] = await Promise.all([
    supabase.from("sumber_donasi").select("id, nama, urutan").order("urutan"),
    supabase.from("seksi").select("id, nama, rencana_anggaran, urutan").order("urutan"),
    supabase
      .from("transaksi")
      .select(
        "id, tanggal, tipe, nominal, keterangan, sumber_donasi_id, seksi_id, status, sumber_donasi(nama), seksi(nama)",
      )
      .order("tanggal", { ascending: false }),
  ]);
  return { sumber: sumber ?? [], seksi: seksi ?? [], trx: trx ?? [] };
}

function Dashboard() {
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: fetchAll });

  const sumber = data?.sumber ?? [];
  const seksi = data?.seksi ?? [];
  const trx = data?.trx ?? [];

  type TrxItem = (typeof trx)[0];

  const sumberRows: SumberRow[] = sumber.map((s) => ({
    id: s.id,
    nama: s.nama,
    urutan: s.urutan,
    nominal: trx
      .filter(
        (t) => t.sumber_donasi_id === s.id && t.tipe === "pemasukan" && t.status === "diterima",
      )
      .reduce((sum, t) => sum + Number(t.nominal), 0),
  }));

  const seksiRows: SeksiRow[] = seksi.map((s) => ({
    id: s.id,
    nama: s.nama,
    rencana: Number(s.rencana_anggaran),
    realisasi: trx
      .filter((t) => t.seksi_id === s.id && t.tipe === "pengeluaran")
      .reduce((sum, t) => sum + Number(t.nominal), 0),
  }));

  const trxRows: TrxRow[] = trx
    .filter((t) => t.status === "diterima")
    .map((t) => ({
      id: t.id,
      tanggal: t.tanggal,
      tipe: t.tipe,
      nominal: Number(t.nominal),
      keterangan: t.keterangan as string | null,
      sumber: (t.sumber_donasi as { nama: string } | null)?.nama ?? null,
      seksi: (t.seksi as { nama: string } | null)?.nama ?? null,
    }));

  const target = seksiRows.reduce((s, r) => s + r.rencana, 0);
  const realisasi = trxRows
    .filter((t) => t.tipe === "pemasukan")
    .reduce((s, t) => s + t.nominal, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <Tabs defaultValue="surat" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="surat">
              <FileText className="mr-2 h-4 w-4" /> Surat Edaran
            </TabsTrigger>
            <TabsTrigger value="laporan">
              <Wallet className="mr-2 h-4 w-4" /> Laporan Keuangan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="surat" className="mt-6">
            <SuratEdaranTab />
          </TabsContent>

          <TabsContent value="laporan" className="mt-6 space-y-6">
            <StatsCards target={target} realisasi={realisasi} />

            <Tabs defaultValue="donasi" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
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
              </TabsList>
              <TabsContent value="donasi" className="mt-4">
                <DonasiTab data={sumberRows} />
              </TabsContent>
              <TabsContent value="seksi" className="mt-4">
                <SeksiTab data={seksiRows} />
              </TabsContent>
              <TabsContent value="transaksi" className="mt-4">
                <TransaksiTab data={trxRows} />
              </TabsContent>
              <TabsContent value="grafik" className="mt-4">
                <GrafikTab seksi={seksiRows} sumber={sumberRows} />
              </TabsContent>
            </Tabs>

            {isLoading && (
              <p className="text-center text-sm text-muted-foreground">Memuat data...</p>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
