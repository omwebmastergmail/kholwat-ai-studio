import { useMemo, useState } from "react";
import { ArrowUpDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRupiah } from "@/lib/format";

export interface SumberRow {
  id: string;
  nama: string;
  urutan: number;
  nominal: number;
}

export function DonasiTab({ data }: { data: SumberRow[] }) {
  const [q, setQ] = useState("");
  const [sortDesc, setSortDesc] = useState<boolean | null>(null);

  const filtered = useMemo(() => {
    let rows = data.filter((r) => r.nama.toLowerCase().includes(q.toLowerCase()));
    if (sortDesc !== null) {
      rows = [...rows].sort((a, b) => (sortDesc ? b.nominal - a.nominal : a.nominal - b.nominal));
    } else {
      rows = [...rows].sort((a, b) => a.urutan - b.urutan);
    }
    return rows;
  }, [data, q, sortDesc]);

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">Sumber Dana Donasi</h2>
        <p className="text-sm text-muted-foreground">Kontribusi per sumber donasi</p>
      </div>
      <div className="relative mb-4">
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r, i) => (
              <TableRow key={r.id}>
                <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                <TableCell className="font-medium">{r.nama}</TableCell>
                <TableCell className="text-right tabular-nums">{formatRupiah(r.nominal)}</TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
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
