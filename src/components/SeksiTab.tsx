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
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Seksi & Anggaran</h2>
        <p className="text-sm text-muted-foreground">
          Rencana anggaran dan realisasi pengeluaran tiap seksi
        </p>
      </div>
      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary hover:bg-primary">
              <TableHead className="w-14 text-primary-foreground">No</TableHead>
              <TableHead className="text-primary-foreground">Seksi</TableHead>
              <TableHead className="text-right text-primary-foreground">Rencana</TableHead>
              <TableHead className="text-right text-primary-foreground">Realisasi</TableHead>
              <TableHead className="text-right text-primary-foreground">Sisa</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((r, i) => {
              const sisa = r.rencana - r.realisasi;
              const pct = r.rencana > 0 ? Math.min(100, (r.realisasi / r.rencana) * 100) : 0;
              return (
                <TableRow key={r.id}>
                  <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                  <TableCell>
                    <div className="font-medium">{r.nama}</div>
                    <Progress value={pct} className="mt-2 h-1.5" />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatRupiah(r.rencana)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatRupiah(r.realisasi)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatRupiah(sisa)}</TableCell>
                </TableRow>
              );
            })}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Tidak ada data
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
