import { useEffect, useMemo, useState } from "react";
import { ArrowUpDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  pria: number;
  wanita: number;
}

export function DonasiTab({ data }: { data: SumberRow[] }) {
  const [q, setQ] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    field: "nama" | "nominal" | "peserta" | null;
    desc: boolean;
  }>({
    field: null,
    desc: false,
  });
  const [page, setPage] = useState(1);
  const [pageSizeRaw, setPageSizeRaw] = useState<"10" | "15" | "25" | "all">("10");

  const filtered = useMemo(() => {
    let rows = data.filter((r) => r.nama.toLowerCase().includes(q.toLowerCase()));

    if (sortConfig.field) {
      rows = [...rows].sort((a, b) => {
        let cmp = 0;
        if (sortConfig.field === "nama") {
          cmp = a.nama.localeCompare(b.nama);
        } else if (sortConfig.field === "nominal") {
          cmp = a.nominal - b.nominal;
        } else if (sortConfig.field === "peserta") {
          const aTotal = a.pria + a.wanita;
          const bTotal = b.pria + b.wanita;
          cmp = aTotal - bTotal;
        }
        return sortConfig.desc ? -cmp : cmp;
      });
    } else {
      rows = [...rows].sort((a, b) => a.urutan - b.urutan);
    }
    return rows;
  }, [data, q, sortConfig]);

  const pageSize = pageSizeRaw === "all" ? Math.max(1, filtered.length) : parseInt(pageSizeRaw, 10);

  // Reset page when search, sort, or page size changes
  useEffect(() => {
    setPage(1);
  }, [q, sortConfig, pageSizeRaw]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedMobile = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (field: "nama" | "nominal" | "peserta") => {
    setSortConfig((current) => {
      if (current.field === field) {
        return { field, desc: !current.desc };
      }
      return { field, desc: false }; // Default true inside if descending preferred? let's stick to asc first unless nominal
    });
  };

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Data Cabang</h2>
          <p className="text-sm text-muted-foreground">Kontribusi dan jamaah per cabang</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari cabang..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
      </div>

      <div className="mb-4 sm:hidden flex flex-wrap gap-2">
        <button
          className="inline-flex items-center gap-2 text-sm font-medium text-primary"
          onClick={() => toggleSort("nama")}
        >
          Urutkan Cabang <ArrowUpDown className="h-4 w-4" />
        </button>
        <button
          className="inline-flex items-center gap-2 text-sm font-medium text-primary"
          onClick={() => toggleSort("peserta")}
        >
          Urutkan Peserta <ArrowUpDown className="h-4 w-4" />
        </button>
        <button
          className="inline-flex items-center gap-2 text-sm font-medium text-primary"
          onClick={() => toggleSort("nominal")}
        >
          Urutkan Nominal <ArrowUpDown className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <span>Tampilkan</span>
        <Select
          value={pageSizeRaw}
          onValueChange={(val: "10" | "15" | "25" | "all") => setPageSizeRaw(val)}
        >
          <SelectTrigger className="h-8 w-[80px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="15">15</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="all">Semua</SelectItem>
          </SelectContent>
        </Select>
        <span>baris</span>
      </div>

      {/* Mobile view */}
      <div className="grid grid-cols-1 gap-3 sm:hidden">
        {paginatedMobile.map((r, i) => (
          <div
            key={r.id}
            className="flex flex-col gap-3 rounded-lg border bg-background p-4 shadow-sm"
          >
            <div className="flex items-center gap-3 border-b pb-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                {(page - 1) * pageSize + i + 1}
              </div>
              <div className="font-semibold text-base">{r.nama}</div>
            </div>
            <div className="flex justify-between items-center bg-muted/30 p-3 rounded-md">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Peserta</span>
                <span className="text-sm font-medium">{r.pria + r.wanita} Orang</span>
                <div className="text-xs text-muted-foreground mt-0.5 whitespace-nowrap">
                  (Pria: {r.pria}, Wanita: {r.wanita})
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-muted-foreground">Kontribusi</span>
                <span className="font-bold text-primary">{formatRupiah(r.nominal)}</span>
              </div>
            </div>
          </div>
        ))}
        {paginatedMobile.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground border rounded-lg">
            Tidak ada data
          </div>
        )}
      </div>

      {/* Desktop view */}
      <div className="hidden sm:block overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary hover:bg-primary">
              <TableHead className="w-14 text-primary-foreground whitespace-nowrap">No</TableHead>
              <TableHead className="text-primary-foreground whitespace-nowrap">
                <button
                  className="inline-flex items-center gap-1 hover:opacity-80 transition-opacity"
                  onClick={() => toggleSort("nama")}
                >
                  Cabang <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead className="text-right text-primary-foreground whitespace-nowrap">
                <button
                  className="inline-flex items-center gap-1 hover:opacity-80 transition-opacity"
                  onClick={() => toggleSort("peserta")}
                >
                  Peserta <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead className="text-right text-primary-foreground whitespace-nowrap">
                <button
                  className="inline-flex items-center gap-1 hover:opacity-80 transition-opacity"
                  onClick={() => toggleSort("nominal")}
                >
                  Nominal <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedMobile.map((r, i) => (
              <TableRow key={r.id}>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {(page - 1) * pageSize + i + 1}
                </TableCell>
                <TableCell className="font-medium">{r.nama}</TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  {r.pria + r.wanita}
                  <span className="text-xs text-muted-foreground ml-1.5 block sm:inline">
                    (P: {r.pria}, W: {r.wanita})
                  </span>
                </TableCell>
                <TableCell className="text-right tabular-nums whitespace-nowrap">
                  {formatRupiah(r.nominal)}
                </TableCell>
              </TableRow>
            ))}
            {paginatedMobile.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
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
