import { Badge } from "@/components/ui/badge";
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
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Daftar Transaksi</h2>
        <p className="text-sm text-muted-foreground">Riwayat pemasukan dan pengeluaran</p>
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary hover:bg-primary">
              <TableHead className="text-primary-foreground">Tanggal</TableHead>
              <TableHead className="text-primary-foreground">Tipe</TableHead>
              <TableHead className="text-primary-foreground">Sumber / Seksi</TableHead>
              <TableHead className="text-primary-foreground">Keterangan</TableHead>
              <TableHead className="text-right text-primary-foreground">Nominal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="whitespace-nowrap">{formatTanggal(r.tanggal)}</TableCell>
                <TableCell>
                  <Badge variant={r.tipe === "pemasukan" ? "default" : "secondary"}>{r.tipe}</Badge>
                </TableCell>
                <TableCell>
                  {r.tipe === "pemasukan" ? (r.sumber ?? "-") : (r.seksi ?? "-")}
                </TableCell>
                <TableCell className="text-muted-foreground">{r.keterangan ?? "-"}</TableCell>
                <TableCell className="text-right tabular-nums">{formatRupiah(r.nominal)}</TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Belum ada transaksi
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
