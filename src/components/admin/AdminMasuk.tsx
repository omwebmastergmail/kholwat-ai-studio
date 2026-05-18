import { Fragment as FragmentRow, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Plus, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRupiah, formatTanggal } from "@/lib/format";
import type { Sumber, Seksi, Trx } from "@/lib/admin-types";
import { StatusBadge } from "./StatusBadge";
import { TransaksiDialog } from "./TransaksiDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  sumber: Sumber[];
  seksi: Seksi[];
  trx: Trx[];
  onChanged: () => void;
}

export function AdminMasuk({ sumber, seksi, trx, onChanged }: Props) {
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Trx | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      trx
        .filter((t) => t.tipe === "pemasukan")
        .sort((a, b) => {
          // pending dulu, lalu tanggal terbaru
          if (a.status === "pending" && b.status !== "pending") return -1;
          if (b.status === "pending" && a.status !== "pending") return 1;
          return b.tanggal.localeCompare(a.tanggal);
        }),
    [trx],
  );

  const pendingCount = rows.filter((r) => r.status === "pending").length;

  const setStatus = async (id: string, status: "diterima" | "ditolak") => {
    const { error } = await supabase.from("transaksi").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(status === "diterima" ? "Donasi diverifikasi" : "Donasi ditolak");
    onChanged();
  };

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Donasi Masuk</h2>
          <p className="text-sm text-muted-foreground">
            Daftar donasi per donatur
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                {pendingCount} menunggu verifikasi
              </span>
            )}
          </p>
        </div>
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

      <div className="grid grid-cols-1 gap-3 sm:hidden mb-4">
        {rows.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground border rounded-lg">
            Belum ada donasi masuk
          </div>
        )}
        {rows.map((r) => {
          const isOpen = expanded === r.id;
          const sumberNama = sumber.find((s) => s.id === r.sumber_donasi_id)?.nama;
          return (
            <div
              key={r.id}
              className="rounded-lg border bg-background p-4 shadow-sm flex flex-col gap-3"
            >
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpanded(isOpen ? null : r.id)}
              >
                <div>
                  <div className="font-semibold text-sm mb-1">{r.donor_nama ?? "-"}</div>
                  <div className="text-xs text-muted-foreground">{formatTanggal(r.tanggal)}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="font-bold tabular-nums text-emerald-600">
                    {formatRupiah(r.nominal)}
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              </div>

              {isOpen && (
                <div className="mt-3 border-t pt-3 flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="block text-xs text-muted-foreground mb-0.5">Kode:</span>
                      <span className="font-medium">{r.kode ?? "-"}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-muted-foreground mb-0.5">Sumber:</span>
                      <span className="font-medium">{sumberNama ?? "-"}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-xs text-muted-foreground mb-0.5">
                        Keterangan:
                      </span>
                      <span className="font-medium">{r.keterangan ?? "-"}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Bukti Bayar:</div>
                    {r.bukti_bayar_url ? (
                      <a href={r.bukti_bayar_url} target="_blank" rel="noreferrer">
                        <img
                          src={r.bukti_bayar_url}
                          alt="bukti"
                          className="h-24 w-24 rounded border object-cover"
                        />
                      </a>
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded border text-xs text-muted-foreground">
                        Tidak ada
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEdit(r);
                        setOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    {r.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setStatus(r.id, "diterima");
                          }}
                        >
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Verifikasi
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setStatus(r.id, "ditolak");
                          }}
                        >
                          <XCircle className="mr-1 h-3.5 w-3.5" /> Tolak
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="hidden sm:block overflow-x-auto rounded-xl border">
        <Table className="min-w-[700px]">
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Tanggal</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead className="text-right">Nominal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => {
              const isOpen = expanded === r.id;
              const sumberNama = sumber.find((s) => s.id === r.sumber_donasi_id)?.nama;
              return (
                <FragmentRow key={r.id}>
                  <TableRow
                    className="cursor-pointer"
                    onClick={() => setExpanded(isOpen ? null : r.id)}
                  >
                    <TableCell className="whitespace-nowrap">{formatTanggal(r.tanggal)}</TableCell>
                    <TableCell className="font-medium">{r.donor_nama ?? "-"}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatRupiah(r.nominal)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={r.status} />
                    </TableCell>
                    <TableCell>
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </TableCell>
                  </TableRow>
                  {isOpen && (
                    <TableRow className="bg-muted/20">
                      <TableCell colSpan={5}>
                        <div className="grid grid-cols-2 gap-4 p-2 text-sm">
                          <div className="space-y-1">
                            <div>
                              <span className="text-muted-foreground">Kode: </span>
                              {r.kode ?? "-"}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Nama: </span>
                              {r.donor_nama ?? "-"}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Sumber: </span>
                              {sumberNama ?? "-"}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Nominal: </span>
                              <b>{formatRupiah(r.nominal)}</b>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Tanggal: </span>
                              {formatTanggal(r.tanggal)}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Status: </span>
                              <StatusBadge status={r.status} />
                            </div>
                            <div>
                              <span className="text-muted-foreground">Keterangan: </span>
                              {r.keterangan ?? "-"}
                            </div>
                          </div>
                          <div>
                            <div className="mb-1 text-muted-foreground">Bukti Bayar</div>
                            {r.bukti_bayar_url ? (
                              <a href={r.bukti_bayar_url} target="_blank" rel="noreferrer">
                                <img
                                  src={r.bukti_bayar_url}
                                  alt="bukti"
                                  className="h-32 w-24 rounded border object-cover"
                                />
                              </a>
                            ) : (
                              <div className="flex h-32 w-24 items-center justify-center rounded border text-xs text-muted-foreground">
                                Tidak ada
                              </div>
                            )}
                            <div className="mt-2 flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEdit(r);
                                  setOpen(true);
                                }}
                              >
                                Edit
                              </Button>
                              {r.status === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setStatus(r.id, "diterima");
                                    }}
                                  >
                                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Verifikasi
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setStatus(r.id, "ditolak");
                                    }}
                                  >
                                    <XCircle className="mr-1 h-3.5 w-3.5" /> Tolak
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </FragmentRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Belum ada donasi masuk
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <TransaksiDialog
        open={open}
        onOpenChange={setOpen}
        initial={edit}
        defaultTipe="pemasukan"
        sumber={sumber}
        seksi={seksi}
        onSaved={onChanged}
      />
    </div>
  );
}
