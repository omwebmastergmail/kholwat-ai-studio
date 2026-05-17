import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { formatRupiah } from "@/lib/format";

export interface SeksiRow {
  id: string;
  nama: string;
  rencana: number;
  realisasi: number;
}

export function SeksiTab({ data }: { data: SeksiRow[] }) {
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const totalPages = Math.ceil(data.length / pageSize);
  const paginatedData = data.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Seksi & Anggaran</h2>
        <p className="text-sm text-muted-foreground">
          Rencana anggaran dan realisasi pengeluaran tiap seksi
        </p>
      </div>

      {/* Mobile view */}
      <div className="grid grid-cols-1 gap-3 sm:hidden">
        {paginatedData.map((r, i) => {
          const sisa = r.rencana - r.realisasi;
          const pct = r.rencana > 0 ? Math.min(100, (r.realisasi / r.rencana) * 100) : 0;
          return (
            <div key={r.id} className="rounded-lg border bg-background p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                  {(page - 1) * pageSize + i + 1}
                </div>
                <div className="font-medium text-sm flex-1">{r.nama}</div>
              </div>
              <Progress value={pct} className="h-1.5 mb-4" />
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Rencana</p>
                  <p className="font-medium tabular-nums">{formatRupiah(r.rencana)}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground text-xs mb-0.5">Realisasi</p>
                  <p className="font-medium tabular-nums text-primary">{formatRupiah(r.realisasi)}</p>
                </div>
                <div className="col-span-2 mt-1">
                  <div className="flex justify-between items-center rounded-md bg-muted/50 px-3 py-2">
                     <span className="text-xs text-muted-foreground">Sisa</span>
                     <span className="font-semibold tabular-nums">{formatRupiah(sisa)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {paginatedData.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground border rounded-lg">
            Tidak ada data
          </div>
        )}
      </div>

      {/* Desktop view */}
      <div className="hidden sm:block overflow-x-auto overflow-y-hidden rounded-xl border">
        <Table className="min-w-[500px]">
          <TableHeader>
            <TableRow className="bg-primary hover:bg-primary">
              <TableHead className="w-14 text-primary-foreground whitespace-nowrap">No</TableHead>
              <TableHead className="text-primary-foreground whitespace-nowrap">Seksi</TableHead>
              <TableHead className="text-right text-primary-foreground whitespace-nowrap">Rencana</TableHead>
              <TableHead className="text-right text-primary-foreground whitespace-nowrap">Realisasi</TableHead>
              <TableHead className="text-right text-primary-foreground whitespace-nowrap">Sisa</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((r, i) => {
              const sisa = r.rencana - r.realisasi;
              const pct = r.rencana > 0 ? Math.min(100, (r.realisasi / r.rencana) * 100) : 0;
              return (
                <TableRow key={r.id}>
                  <TableCell className="text-muted-foreground whitespace-nowrap">{(page - 1) * pageSize + i + 1}</TableCell>
                  <TableCell>
                    <div className="font-medium whitespace-nowrap">{r.nama}</div>
                    <Progress value={pct} className="mt-2 h-1.5" />
                  </TableCell>
                  <TableCell className="text-right tabular-nums whitespace-nowrap">
                    {formatRupiah(r.rencana)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums whitespace-nowrap">
                    {formatRupiah(r.realisasi)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums whitespace-nowrap">{formatRupiah(sisa)}</TableCell>
                </TableRow>
              );
            })}
            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Tidak ada data
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
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Sebelumnya
          </button>
          <span className="text-muted-foreground">
            Halaman {page} dari {totalPages}
          </span>
          <button
            className="rounded-md border bg-background px-3 py-1 hover:bg-muted disabled:opacity-50"
            disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            Selanjutnya
          </button>
        </div>
      )}
    </div>
  );
}
