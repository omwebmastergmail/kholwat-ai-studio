import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRupiah, formatTanggal } from "@/lib/format";

export interface TrxRow {
  id: string;
  tanggal: string;
  sumber: string | null;
  seksi: string | null;
  tipe: "pemasukan" | "pengeluaran";
  nominal: number;
  keterangan: string | null;
}

export function TransaksiTab({ data }: { data: TrxRow[] }) {
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const totalPages = Math.ceil(data.length / pageSize);
  const paginatedData = data.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Daftar Transaksi</h2>
        <p className="text-sm text-muted-foreground">Riwayat pemasukan dan pengeluaran</p>
      </div>

      {/* Mobile view */}
      <div className="grid grid-cols-1 gap-3 sm:hidden">
        {paginatedData.map((r) => (
          <div
            key={r.id}
            className="flex flex-col gap-3 rounded-lg border bg-background p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-sm mb-1">
                  {r.tipe === "pemasukan" ? (r.sumber ?? "-") : (r.seksi ?? "-")}
                </p>
                <p className="text-xs text-muted-foreground">{formatTanggal(r.tanggal)}</p>
              </div>
              <Badge
                variant={r.tipe === "pemasukan" ? "default" : "secondary"}
                className={cn(
                  "shrink-0",
                  r.tipe === "pengeluaran" &&
                    "bg-red-500 text-white border-transparent hover:bg-red-600",
                )}
              >
                {r.tipe === "pemasukan" ? "MASUK" : "KELUAR"}
              </Badge>
            </div>

            {r.keterangan && (
              <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded-md">
                {r.keterangan}
              </p>
            )}

            <div className="flex justify-between items-center pt-2 border-t mt-1">
              <span className="text-xs font-medium text-muted-foreground">Nominal</span>
              <span
                className={cn(
                  "font-bold flex items-center gap-1",
                  r.tipe === "pemasukan" ? "text-primary" : "text-red-500",
                )}
              >
                {r.tipe === "pemasukan" ? (
                  <Plus className="h-3.5 w-3.5" />
                ) : (
                  <Minus className="h-3.5 w-3.5" />
                )}
                {formatRupiah(r.nominal)}
              </span>
            </div>
          </div>
        ))}
        {paginatedData.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground border rounded-lg">
            Belum ada transaksi
          </div>
        )}
      </div>

      {/* Desktop view */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow className="bg-primary hover:bg-primary">
              <TableHead className="text-primary-foreground whitespace-nowrap">Tanggal</TableHead>
              <TableHead className="text-primary-foreground whitespace-nowrap">Tipe</TableHead>
              <TableHead className="text-primary-foreground whitespace-nowrap">
                Sumber / Seksi
              </TableHead>
              <TableHead className="text-primary-foreground whitespace-nowrap">
                Keterangan
              </TableHead>
              <TableHead className="text-right text-primary-foreground whitespace-nowrap">
                Nominal
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="whitespace-nowrap">{formatTanggal(r.tanggal)}</TableCell>
                <TableCell>
                  <Badge
                    variant={r.tipe === "pemasukan" ? "default" : "secondary"}
                    className={cn(
                      "whitespace-nowrap",
                      r.tipe === "pengeluaran" &&
                        "bg-red-500 text-white border-transparent hover:bg-red-600",
                    )}
                  >
                    {r.tipe === "pemasukan" ? "MASUK" : "KELUAR"}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {r.tipe === "pemasukan" ? (r.sumber ?? "-") : (r.seksi ?? "-")}
                </TableCell>
                <TableCell className="text-muted-foreground min-w-[200px]">
                  {r.keterangan ?? "-"}
                </TableCell>
                <TableCell className="text-right tabular-nums whitespace-nowrap">
                  <div
                    className={cn(
                      "flex items-center justify-end font-medium gap-1",
                      r.tipe === "pemasukan" ? "text-primary" : "text-red-500",
                    )}
                  >
                    {r.tipe === "pemasukan" ? (
                      <Plus className="h-3.5 w-3.5" />
                    ) : (
                      <Minus className="h-3.5 w-3.5" />
                    )}
                    {formatRupiah(r.nominal)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Belum ada transaksi
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between sm:justify-end gap-2 text-sm">
          <button
            className="rounded-md border bg-background px-3 py-1 hover:bg-muted disabled:opacity-50"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Sebelumnya
          </button>
          <span className="text-muted-foreground">
            Halaman {page} dari {totalPages}
          </span>
          <button
            className="rounded-md border bg-background px-3 py-1 hover:bg-muted disabled:opacity-50"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Selanjutnya
          </button>
        </div>
      )}
    </div>
  );
}
