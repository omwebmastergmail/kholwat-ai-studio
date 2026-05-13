import { useMemo, useState } from "react";
import { Pencil, Trash2, Plus, FileSpreadsheet, FileText, Search, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatRupiah } from "@/lib/format";
import { exportXlsx, exportPdf } from "@/lib/exporters";
import type { Sumber, Trx } from "@/lib/admin-types";
import { SumberDialog } from "./SumberDialog";

interface Props {
  sumber: Sumber[];
  trx: Trx[];
  onChanged: () => void;
}

export function AdminDonasi({ sumber, trx, onChanged }: Props) {
  const [q, setQ] = useState("");
  const [sortDesc, setSortDesc] = useState<boolean | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Sumber | null>(null);

  const rows = useMemo(() => {
    const withNominal = sumber.map((s) => ({
      ...s,
      nominal: trx
        .filter(
          (t) => t.sumber_donasi_id === s.id && t.tipe === "pemasukan" && t.status === "diterima",
        )
        .reduce((a, t) => a + Number(t.nominal), 0),
    }));
    let r = withNominal.filter((s) => s.nama.toLowerCase().includes(q.toLowerCase()));
    if (sortDesc !== null)
      r = [...r].sort((a, b) => (sortDesc ? b.nominal - a.nominal : a.nominal - b.nominal));
    else r = [...r].sort((a, b) => a.urutan - b.urutan);
    return r;
  }, [sumber, trx, q, sortDesc]);

  const visible = showAll ? rows : rows.slice(0, 15);
  const total = rows.reduce((a, r) => a + r.nominal, 0);

  const del = async (id: string) => {
    if (!confirm("Hapus sumber ini?")) return;
    const { error } = await supabase.from("sumber_donasi").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Dihapus");
    onChanged();
  };

  const doSeed = async () => {
    if (!confirm("Seed data default (akan mengabaikan yang sudah ada dengan nama yang sama)?"))
      return;
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
    const { error } = await supabase.from("sumber_donasi").upsert(
      seed.map((n, i) => ({ nama: n, urutan: i + 1 })),
      { onConflict: "nama" },
    );
    if (error) return toast.error(error.message);
    toast.success("Seed sukses");
    onChanged();
  };

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Sumber Dana Donasi</h2>
          <p className="text-sm text-muted-foreground">Kontribusi per sumber donasi</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={doSeed}>
            Seed
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              exportXlsx(
                "sumber-donasi",
                "Donasi",
                rows.map((r, i) => ({ No: i + 1, Sumber: r.nama, Nominal: r.nominal })),
              )
            }
          >
            <FileSpreadsheet className="mr-1 h-4 w-4" /> Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600"
            onClick={() =>
              exportPdf(
                "Sumber Dana Donasi",
                "sumber-donasi",
                ["No", "Sumber", "Nominal"],
                rows.map((r, i) => [i + 1, r.nama, formatRupiah(r.nominal)]),
              )
            }
          >
            <FileText className="mr-1 h-4 w-4" /> PDF
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEdit(null);
              setOpen(true);
            }}
          >
            <Plus className="mr-1 h-4 w-4" /> Tambah
          </Button>
        </div>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari sumber donasi..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary hover:bg-primary">
              <TableHead className="w-14 text-primary-foreground">No</TableHead>
              <TableHead className="text-primary-foreground">Sumber Donasi</TableHead>
              <TableHead className="text-right text-primary-foreground">
                <button
                  className="inline-flex items-center gap-1"
                  onClick={() => setSortDesc((s) => (s === null ? true : !s))}
                >
                  Nominal <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead className="w-24 text-right text-primary-foreground">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((r, i) => (
              <TableRow key={r.id}>
                <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                <TableCell className="font-medium">{r.nama}</TableCell>
                <TableCell className="text-right tabular-nums">{formatRupiah(r.nominal)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-emerald-600"
                    onClick={() => {
                      setEdit(r);
                      setOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-red-600"
                    onClick={() => del(r.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {rows.length > 15 && !showAll && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  <Button variant="ghost" size="sm" onClick={() => setShowAll(true)}>
                    Tampilkan lagi ({rows.length - 15} sisa)
                  </Button>
                </TableCell>
              </TableRow>
            )}
            <TableRow className="bg-muted/40 font-semibold">
              <TableCell colSpan={2}>Total</TableCell>
              <TableCell className="text-right tabular-nums">{formatRupiah(total)}</TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <SumberDialog open={open} onOpenChange={setOpen} initial={edit} onSaved={onChanged} />
    </div>
  );
}
