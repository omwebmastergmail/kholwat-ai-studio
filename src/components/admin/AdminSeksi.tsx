import { Fragment as FragmentRow, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { NominalInput } from "@/components/admin/NominalInput";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { formatRupiah, formatTanggal } from "@/lib/format";
import { exportPdf } from "@/lib/exporters";
import { cn } from "@/lib/utils";
import type { Seksi, Trx } from "@/lib/admin-types";

interface Props {
  seksi: Seksi[];
  trx: Trx[];
  masuk: number;
  onChanged: () => void;
}

type FormState = { id?: string; nama: string; rencana_anggaran: number; urutan: number };
const emptyForm: FormState = { nama: "", rencana_anggaran: 0, urutan: 0 };

export function AdminSeksi({ seksi, trx, masuk, onChanged }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [del, setDel] = useState<Seksi | null>(null);
  const [busy, setBusy] = useState(false);

  const rows = useMemo(() => {
    return seksi
      .map((s) => {
        const realisasi = trx
          .filter((t) => t.seksi_id === s.id && t.tipe === "pengeluaran")
          .reduce((a, t) => a + Number(t.nominal), 0);
        const jumlahTrx = trx.filter((t) => t.seksi_id === s.id).length;
        return { ...s, realisasi, jumlahTrx };
      })
      .sort((a, b) => a.urutan - b.urutan);
  }, [seksi, trx]);

  const totalAnggaran = rows.reduce((a, r) => a + Number(r.rencana_anggaran), 0);
  const totalRealisasi = rows.reduce((a, r) => a + r.realisasi, 0);

  const openAdd = () =>
    setForm({ ...emptyForm, urutan: (seksi[seksi.length - 1]?.urutan ?? 0) + 1 });
  const openEdit = (s: Seksi) =>
    setForm({
      id: s.id,
      nama: s.nama,
      rencana_anggaran: Number(s.rencana_anggaran),
      urutan: s.urutan,
    });

  const save = async () => {
    if (!form) return;
    if (!form.nama.trim()) return toast.error("Nama seksi wajib diisi");
    setBusy(true);
    const payload = {
      nama: form.nama.trim(),
      rencana_anggaran: form.rencana_anggaran,
      urutan: form.urutan,
    };
    const { error } = form.id
      ? await supabase.from("seksi").update(payload).eq("id", form.id)
      : await supabase.from("seksi").insert(payload);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(form.id ? "Seksi diperbarui" : "Seksi ditambahkan");
    setForm(null);
    onChanged();
  };

  const confirmDelete = async () => {
    if (!del) return;
    setBusy(true);
    const { error } = await supabase.from("seksi").delete().eq("id", del.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Seksi dihapus");
    setDel(null);
    onChanged();
  };

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Ringkasan Anggaran per Seksi</h2>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs">
            <div>
              <span className="text-muted-foreground">Anggaran </span>
              <b>{formatRupiah(totalAnggaran)}</b>
            </div>
            <div>
              <span className="text-muted-foreground">Dana Masuk </span>
              <b className="text-emerald-600">{formatRupiah(masuk)}</b>
            </div>
            <div>
              <span className="text-muted-foreground">Realisasi </span>
              <b className="text-red-600">{formatRupiah(totalRealisasi)}</b>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-red-600"
            onClick={() =>
              exportPdf(
                "Anggaran per Seksi",
                "seksi",
                ["No", "Seksi", "Anggaran", "Realisasi", "%"],
                rows.map((r, i) => [
                  i + 1,
                  r.nama,
                  formatRupiah(r.rencana_anggaran),
                  formatRupiah(r.realisasi),
                  r.rencana_anggaran > 0
                    ? `${Math.round((r.realisasi / r.rencana_anggaran) * 100)}%`
                    : "-",
                ]),
              )
            }
          >
            <FileText className="mr-1 h-4 w-4" /> PDF
          </Button>
          <Button size="sm" onClick={openAdd}>
            <Plus className="mr-1 h-4 w-4" /> Tambah Seksi
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:hidden">
        {rows.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground border rounded-lg">
            Belum ada seksi. Klik "Tambah Seksi" untuk memulai.
          </div>
        )}
        {rows.map((r, i) => {
          const pct = r.rencana_anggaran > 0 ? (r.realisasi / Number(r.rencana_anggaran)) * 100 : 0;
          const pctColor =
            pct > 100 ? "text-red-600" : pct >= 80 ? "text-amber-600" : "text-emerald-600";
          const barColor = pct > 100 ? "bg-red-500" : pct >= 80 ? "bg-amber-500" : "bg-emerald-500";
          const selisih = r.realisasi - Number(r.rencana_anggaran);
          const isOpen = expanded === r.id;
          const detail = trx
            .filter((t) => t.seksi_id === r.id && t.tipe === "pengeluaran")
            .sort((a, b) => b.tanggal.localeCompare(a.tanggal));

          return (
            <div key={r.id} className="rounded-lg border bg-background p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <button
                    className="flex w-full items-center gap-1 font-medium text-left"
                    onClick={() => setExpanded(isOpen ? null : r.id)}
                  >
                    {r.nama}{" "}
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0" />
                    )}
                  </button>
                </div>
              </div>
              <Progress value={pct} className={cn("h-1.5 mb-4", barColor)} />
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Anggaran</p>
                  <p className="font-medium tabular-nums">{formatRupiah(r.rencana_anggaran)}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground text-xs mb-0.5">Realisasi</p>
                  <p className="font-medium tabular-nums text-primary">
                    {formatRupiah(r.realisasi)}
                  </p>
                </div>
                <div className="col-span-2 mt-1">
                  <div className="flex justify-between items-center rounded-md bg-muted/50 px-3 py-2">
                    <span className="text-xs text-muted-foreground">Persentase</span>
                    <span className={cn("font-semibold tabular-nums", pctColor)}>
                      {r.rencana_anggaran > 0 ? `${Math.round(pct)}%` : "-"}
                    </span>
                  </div>
                </div>
                {selisih !== 0 && (
                  <div className="col-span-2 flex justify-between items-center px-3 py-1">
                    <span className="text-xs text-muted-foreground">Sisa/Kurang</span>
                    <span
                      className={cn(
                        "font-medium tabular-nums text-xs",
                        selisih > 0 ? "text-red-600" : "text-emerald-600",
                      )}
                    >
                      {selisih > 0 ? "+" : ""}
                      {formatRupiah(selisih)}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-4 flex gap-2 justify-end border-t pt-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-emerald-600 h-8 gap-1"
                  onClick={() => openEdit(r)}
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 h-8 gap-1"
                  onClick={() => setDel(r)}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Hapus
                </Button>
              </div>
              {isOpen && (
                <div className="mt-3 border-t pt-3 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">DETAIL PENGELUARAN</p>
                  {detail.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Belum ada pengeluaran.</p>
                  ) : (
                    detail.map((d) => (
                      <div
                        key={d.id}
                        className="flex justify-between items-start gap-2 border-b pb-2 last:border-0 last:pb-0"
                      >
                        <div>
                          <p className="text-xs font-medium">{d.keterangan || "-"}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {formatTanggal(d.tanggal)}
                          </p>
                        </div>
                        <p className="text-xs text-red-600 tabular-nums font-medium whitespace-nowrap">
                          -{formatRupiah(d.nominal)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop view */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow className="bg-primary hover:bg-primary">
              <TableHead className="w-12 text-primary-foreground whitespace-nowrap">No</TableHead>
              <TableHead className="text-primary-foreground whitespace-nowrap">
                Nama Seksi
              </TableHead>
              <TableHead className="text-right text-primary-foreground whitespace-nowrap">
                Anggaran
              </TableHead>
              <TableHead className="text-right text-primary-foreground whitespace-nowrap">
                Realisasi
              </TableHead>
              <TableHead className="w-20 text-right text-primary-foreground whitespace-nowrap">
                %
              </TableHead>
              <TableHead className="w-24 text-right text-primary-foreground whitespace-nowrap">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  Belum ada seksi. Klik "Tambah Seksi" untuk memulai.
                </TableCell>
              </TableRow>
            )}
            {rows.map((r, i) => {
              const pct =
                r.rencana_anggaran > 0 ? (r.realisasi / Number(r.rencana_anggaran)) * 100 : 0;
              const pctColor =
                pct > 100 ? "text-red-600" : pct >= 80 ? "text-amber-600" : "text-emerald-600";
              const barColor =
                pct > 100 ? "bg-red-500" : pct >= 80 ? "bg-amber-500" : "bg-emerald-500";
              const selisih = r.realisasi - Number(r.rencana_anggaran);
              const isOpen = expanded === r.id;
              const detail = trx
                .filter((t) => t.seksi_id === r.id && t.tipe === "pengeluaran")
                .sort((a, b) => b.tanggal.localeCompare(a.tanggal));
              return (
                <FragmentRow key={r.id}>
                  <TableRow>
                    <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                    <TableCell>
                      <button
                        className="flex items-center gap-1 font-medium"
                        onClick={() => setExpanded(isOpen ? null : r.id)}
                      >
                        {r.nama}{" "}
                        {isOpen ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </button>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn("h-full", barColor)}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatRupiah(r.rencana_anggaran)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatRupiah(r.realisasi)}
                      {selisih !== 0 && (
                        <div
                          className={cn(
                            "text-xs",
                            selisih > 0 ? "text-red-600" : "text-emerald-600",
                          )}
                        >
                          {selisih > 0 ? "+" : ""}
                          {formatRupiah(selisih)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className={cn("text-right font-semibold tabular-nums", pctColor)}>
                      {r.rencana_anggaran > 0 ? `${Math.round(pct)}%` : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-emerald-600"
                          onClick={() => openEdit(r)}
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-red-600"
                          onClick={() => setDel(r)}
                          title="Hapus"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {isOpen && (
                    <TableRow className="bg-muted/20">
                      <TableCell colSpan={6}>
                        {detail.length === 0 ? (
                          <p className="p-2 text-sm text-muted-foreground">
                            Belum ada transaksi pengeluaran untuk seksi ini.
                          </p>
                        ) : (
                          <ul className="space-y-1 p-2 text-sm">
                            {detail.map((d) => (
                              <li
                                key={d.id}
                                className="flex justify-between gap-3 border-b border-border/50 py-1 last:border-0"
                              >
                                <span className="truncate">
                                  {d.keterangan ?? "-"}{" "}
                                  <span className="text-xs text-muted-foreground">
                                    {formatTanggal(d.tanggal)}
                                  </span>
                                </span>
                                <span className="shrink-0 tabular-nums text-red-600">
                                  -{formatRupiah(d.nominal)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </FragmentRow>
              );
            })}
            {rows.length > 0 && (
              <TableRow className="bg-muted/40 font-semibold">
                <TableCell colSpan={2}>Total</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatRupiah(totalAnggaran)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatRupiah(totalRealisasi)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {totalAnggaran > 0
                    ? `${Math.round((totalRealisasi / totalAnggaran) * 100)}%`
                    : "-"}
                </TableCell>
                <TableCell />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!form} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{form?.id ? `Edit Seksi — ${form.nama}` : "Tambah Seksi"}</DialogTitle>
          </DialogHeader>
          {form && (
            <div className="space-y-3">
              <div>
                <Label>Nama Seksi</Label>
                <Input
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  placeholder="Mis. Konsumsi"
                />
              </div>
              <div>
                <Label>Rencana Anggaran (Rp)</Label>
                <NominalInput
                  value={form.rencana_anggaran}
                  onChange={(v) => setForm({ ...form, rencana_anggaran: v })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Urutan Tampil</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.urutan}
                  onChange={(e) => setForm({ ...form, urutan: Number(e.target.value) })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setForm(null)}>
              Batal
            </Button>
            <Button onClick={save} disabled={busy}>
              {busy ? "..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!del} onOpenChange={(o) => !o && setDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus seksi "{del?.nama}"?</AlertDialogTitle>
            <AlertDialogDescription>
              {(() => {
                const count = del ? trx.filter((t) => t.seksi_id === del.id).length : 0;
                return count > 0
                  ? `Seksi ini memiliki ${count} transaksi terkait. Penghapusan akan gagal jika transaksi masih ada — hapus transaksi-nya terlebih dahulu.`
                  : "Tindakan ini tidak dapat dibatalkan.";
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={busy}
              className="bg-red-600 hover:bg-red-700"
            >
              {busy ? "..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
