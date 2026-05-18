import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Sumber } from "@/lib/admin-types";

// Note: Ensure XLSX is in package.json or use read_browser_page? Actually xlsx is already in package.json!

export function AdminPeserta({ sumber, onChanged }: { sumber: Sumber[]; onChanged: () => void }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const { data: pesertaList = [], isLoading } = useQuery({
    queryKey: ["peserta_admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("peserta")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const importsMutation = useMutation({
    mutationFn: async (rows: Record<string, unknown>[]) => {
      const { error } = await supabase.from("peserta").insert(rows);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["peserta_admin"] });
      toast.success("Berhasil import data peserta");
    },
    onError: (e) => {
      console.error(e);
      toast.error("Gagal import data");
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        const rowsToInsert = data.map((rowRef: unknown) => {
          const row = rowRef as Record<string, unknown>;
          // Find cabang matching the cell content
          const s = sumber.find((smb) =>
            smb.nama.toLowerCase().includes(String(row["Cabang"] || "").toLowerCase()),
          );

          // normalize gender
          let jk = null;
          const rJk = String(row["Jenis Kelamin"] || "").toLowerCase();
          if (rJk.startsWith("p") || rJk === "l" || rJk === "laki-laki" || rJk === "laki") {
            jk = "pria";
          } else if (rJk.startsWith("w") || rJk === "p" || rJk === "perempuan") {
            jk = "wanita";
          }

          return {
            nama: String(row["Nama"] || row["nama"] || "-").trim(),
            jenis_kelamin: jk,
            sumber_donasi_id: s ? s.id : null,
            no_wa: String(row["No WA"] || row["No wa"] || row["no_wa"] || ""),
          };
        });

        if (rowsToInsert.length === 0) {
          toast.error("Format Excel kosong atau tidak sesuai");
          return;
        }

        await importsMutation.mutateAsync(rowsToInsert);
      } catch (err) {
        toast.error("Gagal membaca file Excel");
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("peserta").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["peserta_admin"] });
    },
  });

  const filtered = pesertaList.filter((p) => p.nama.toLowerCase().includes(q.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Data Peserta</h2>
          <p className="text-sm text-muted-foreground">Kelola data jamaah / peserta</p>
        </div>
        <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
          <Input
            placeholder="Cari nama..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full sm:w-[200px]"
          />

          <PesertaDialog sumber={sumber} />

          <input
            type="file"
            accept=".xlsx, .xls"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => fileInputRef.current?.click()}
            disabled={importsMutation.isPending}
          >
            {importsMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Import Excel
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">No</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>L/P</TableHead>
              <TableHead>Cabang</TableHead>
              <TableHead>No WA</TableHead>
              <TableHead className="w-[80px] text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  Belum ada data peserta.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((p, i) => {
                const s = sumber.find((smb) => smb.id === p.sumber_donasi_id);
                return (
                  <TableRow key={p.id}>
                    <TableCell>{(page - 1) * pageSize + i + 1}</TableCell>
                    <TableCell className="font-medium">{p.nama}</TableCell>
                    <TableCell>
                      {p.jenis_kelamin === "pria"
                        ? "Pria"
                        : p.jenis_kelamin === "wanita"
                          ? "Wanita"
                          : "-"}
                    </TableCell>
                    <TableCell>{s?.nama ?? "-"}</TableCell>
                    <TableCell>{p.no_wa || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700"
                        onClick={() => {
                          if (confirm("Hapus peserta ini?")) {
                            deleteMutation.mutate(p.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Prev
          </Button>
          <span className="text-sm text-muted-foreground">
            Hal {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

function PesertaDialog({ sumber }: { sumber: Sumber[] }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const [nama, setNama] = useState("");
  const [jk, setJk] = useState<string>("pria");
  const [cab, setCab] = useState("");
  const [wa, setWa] = useState("");

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("peserta").insert({
        nama,
        jenis_kelamin: jk,
        sumber_donasi_id: cab || null,
        no_wa: wa,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["peserta_admin"] });
      toast.success("Berhasil menambahkan peserta");
      setOpen(false);
      // reset
      setNama("");
      setJk("pria");
      setCab("");
      setWa("");
    },
    onError: (err: Error) => {
      console.error(err);
      toast.error("Gagal menambahkan: " + (err?.message || "Unknown error"));
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Tambah
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Peserta</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-1.5">
            <Label>Nama</Label>
            <Input value={nama} onChange={(e) => setNama(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Jenis Kelamin</Label>
            <Select value={jk} onValueChange={setJk}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pria">Pria</SelectItem>
                <SelectItem value="wanita">Wanita</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Cabang (Sumber Donasi)</Label>
            <Select value={cab} onValueChange={setCab}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih cabang" />
              </SelectTrigger>
              <SelectContent>
                {sumber.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>No WA (Opsional)</Label>
            <Input value={wa} onChange={(e) => setWa(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button disabled={!nama || saveMutation.isPending} onClick={() => saveMutation.mutate()}>
            {saveMutation.isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
