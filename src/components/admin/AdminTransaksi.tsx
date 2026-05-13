import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  FileSpreadsheet,
  FileText,
  Filter,
  Pencil,
  Plus,
  Search,
  Trash2,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { exportXlsx, exportPdf } from "@/lib/exporters";
import type { Sumber, Seksi, Trx } from "@/lib/admin-types";
import { TransaksiDialog } from "./TransaksiDialog";
import { cn } from "@/lib/utils";

interface Props {
  sumber: Sumber[];
  seksi: Seksi[];
  trx: Trx[];
  onChanged: () => void;
}

export function AdminTransaksi({ sumber, seksi, trx, onChanged }: Props) {
  const [q, setQ] = useState("");
  const [tipeFilter, setTipeFilter] = useState<"all" | "pemasukan" | "pengeluaran">("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Trx | null>(null);

  const filtered = useMemo(() => {
    let r = trx.slice().sort((a, b) => b.tanggal.localeCompare(a.tanggal));
    if (tipeFilter !== "all") r = r.filter((t) => t.tipe === tipeFilter);
    if (q) {
      const ql = q.toLowerCase();
      r = r.filter((t) => {
        const ref =
          t.tipe === "pemasukan"
            ? (sumber.find((s) => s.id === t.sumber_donasi_id)?.nama ?? "")
            : (seksi.find((s) => s.id === t.seksi_id)?.nama ?? "");
        return (
          (t.keterangan ?? "").toLowerCase().includes(ql) ||
          ref.toLowerCase().includes(ql) ||
          String(t.nominal).includes(ql)
        );
      });
    }
    return r;
  }, [trx, tipeFilter, q, sumber, seksi]);

  const masuk = trx
    .filter((t) => t.tipe === "pemasukan" && t.status === "diterima")
    .reduce((a, t) => a + Number(t.nominal), 0);
  const keluar = trx
    .filter((t) => t.tipe === "pengeluaran")
    .reduce((a, t) => a + Number(t.nominal), 0);
  const saldo = masuk - keluar;

  const total = filtered.length;
  const start = page * perPage;
  const visible = filtered.slice(start, start + perPage);
  const lastPage = Math.max(0, Math.ceil(total / perPage) - 1);

  const del = async (id: string) => {
    if (!confirm("Hapus transaksi ini?")) return;
    const { error } = await supabase.from("transaksi").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Dihapus");
    onChanged();
  };

  const refOf = (t: Trx) =>
    t.tipe === "pemasukan"
      ? (sumber.find((s) => s.id === t.sumber_donasi_id)?.nama ?? "-")
      : (seksi.find((s) => s.id === t.seksi_id)?.nama ?? "-");

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-lg font-semibold">Laporan Dana Masuk & Keluar</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-emerald-700"
            onClick={() =>
              exportXlsx(
                "transaksi",
                "Transaksi",
                filtered.map((t, i) => ({
                  No: i + 1,
                  Tanggal: t.tanggal,
                  Tipe: t.tipe,
                  Referensi: refOf(t),
                  Keterangan: t.keterangan ?? "",
                  Nominal: t.nominal,
                  Status: t.status,
                })),
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
                "Laporan Transaksi",
                "transaksi",
                ["No", "Tanggal", "Tipe", "Referensi", "Keterangan", "Nominal"],
                filtered.map((t, i) => [
                  i + 1,
                  formatTanggal(t.tanggal),
                  t.tipe,
                  refOf(t),
                  t.keterangan ?? "",
                  formatRupiah(t.nominal),
                ]),
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

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          color="emerald"
          icon={<ArrowDownLeft className="h-5 w-5" />}
          label="MASUK"
          value={masuk}
        />
        <StatCard
          color="red"
          icon={<ArrowUpRight className="h-5 w-5" />}
          label="KELUAR"
          value={keluar}
        />
        <StatCard color="blue" icon={<Wallet className="h-5 w-5" />} label="SALDO" value={saldo} />
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari keterangan, nominal, kategori..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(0);
            }}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm" onClick={() => setFilterOpen((v) => !v)}>
          <Filter className="mr-1 h-4 w-4" /> Filter
        </Button>
      </div>
      {filterOpen && (
        <div className="mb-3 flex gap-2">
          <Select
            value={tipeFilter}
            onValueChange={(v) => {
              setTipeFilter(v as "all" | "pemasukan" | "pengeluaran");
              setPage(0);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua tipe</SelectItem>
              <SelectItem value="pemasukan">Pemasukan</SelectItem>
              <SelectItem value="pengeluaran">Pengeluaran</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        {visible.map((t, i) => {
          const isIn = t.tipe === "pemasukan";
          return (
            <div key={t.id} className="flex items-center gap-3 rounded-xl border bg-card p-3">
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  isIn ? "bg-emerald-100 text-emerald-700" : "bg-red-50 text-red-600",
                )}
              >
                {start + i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold uppercase">
                  {t.keterangan ?? (isIn ? (t.donor_nama ?? "DONASI") : "TRANSAKSI")}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatTanggal(t.tanggal)} · {refOf(t)}
                </div>
              </div>
              {t.bukti_bayar_url && (
                <a href={t.bukti_bayar_url} target="_blank" rel="noreferrer" className="shrink-0">
                  <img
                    src={t.bukti_bayar_url}
                    alt="bukti"
                    className="h-10 w-10 rounded border object-cover"
                  />
                </a>
              )}
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-emerald-600"
                onClick={() => {
                  setEdit(t);
                  setOpen(true);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-red-600"
                onClick={() => del(t.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <div
                className={cn(
                  "w-28 text-right text-sm font-semibold tabular-nums",
                  isIn ? "text-emerald-600" : "text-red-600",
                )}
              >
                {isIn ? "+" : "-"}
                {formatRupiah(t.nominal)}
              </div>
            </div>
          );
        })}
        {visible.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">Tidak ada transaksi</p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          Rows:
          <Select
            value={String(perPage)}
            onValueChange={(v) => {
              setPerPage(Number(v));
              setPage(0);
            }}
          >
            <SelectTrigger className="h-8 w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <span>
            {total === 0 ? "0" : `${start + 1}-${Math.min(start + perPage, total)} / ${total}`}
          </span>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            ‹
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8"
            disabled={page >= lastPage}
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
          >
            ›
          </Button>
        </div>
      </div>

      <TransaksiDialog
        open={open}
        onOpenChange={setOpen}
        initial={edit}
        sumber={sumber}
        seksi={seksi}
        onSaved={onChanged}
      />
    </div>
  );
}

function StatCard({
  color,
  icon,
  label,
  value,
}: {
  color: "emerald" | "red" | "blue";
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  const cls = {
    emerald: "bg-emerald-600 text-white",
    red: "bg-red-600 text-white",
    blue: "bg-blue-600 text-white",
  }[color];
  return (
    <div className={cn("rounded-2xl p-4 shadow-sm", cls)}>
      <div className="flex items-center gap-2 opacity-90">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
          {icon}
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-2 text-xl font-bold tabular-nums sm:text-2xl">
        {formatRupiah(value).replace("Rp ", "")}
      </p>
    </div>
  );
}
