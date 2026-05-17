import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NominalInput } from "@/components/admin/NominalInput";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Sumber, Seksi, Trx, TrxStatus } from "@/lib/admin-types";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Trx | null;
  defaultTipe?: "pemasukan" | "pengeluaran";
  sumber: Sumber[];
  seksi: Seksi[];
  onSaved: () => void;
}

export function TransaksiDialog({
  open,
  onOpenChange,
  initial,
  defaultTipe,
  sumber,
  seksi,
  onSaved,
}: Props) {
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [tipe, setTipe] = useState<"pemasukan" | "pengeluaran">(defaultTipe ?? "pemasukan");
  const [sumberId, setSumberId] = useState("");
  const [seksiId, setSeksiId] = useState("");
  const [nominal, setNominal] = useState(0);
  const [keterangan, setKeterangan] = useState("");
  const [donorNama, setDonorNama] = useState("");
  const [donorGender, setDonorGender] = useState<"Pria" | "Wanita">("Pria");
  const [kode, setKode] = useState("");
  const [status, setStatus] = useState<TrxStatus>("diterima");
  const [file, setFile] = useState<File | null>(null);
  const [existingUrl, setExistingUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setTanggal(initial.tanggal);
      setTipe(initial.tipe);
      setSumberId(initial.sumber_donasi_id ?? "");
      setSeksiId(initial.seksi_id ?? "");
      setNominal(Number(initial.nominal));
      setKeterangan(initial.keterangan ?? "");
      let dn = initial.donor_nama ?? "";
      if (dn.includes("[Pria]")) {
        setDonorGender("Pria");
        dn = dn.replace("[Pria]", "").trim();
      } else if (dn.includes("[Wanita]")) {
        setDonorGender("Wanita");
        dn = dn.replace("[Wanita]", "").trim();
      }
      setDonorNama(dn);
      setKode(initial.kode ?? "");
      setStatus(initial.status);
      setExistingUrl(initial.bukti_bayar_url);
    } else {
      setTanggal(new Date().toISOString().slice(0, 10));
      setTipe(defaultTipe ?? "pemasukan");
      setSumberId("");
      setSeksiId("");
      setNominal(0);
      setKeterangan("");
      setDonorNama("");
      setDonorGender("Pria");
      setKode("");
      setStatus("diterima");
      setExistingUrl(null);
    }
    setFile(null);
  }, [open, initial, defaultTipe]);

  const submit = async () => {
    if (!nominal || nominal <= 0) return toast.error("Nominal wajib diisi");
    setBusy(true);
    try {
      let buktiUrl = existingUrl;
      if (file) {
        const ext = file.name.split(".").pop();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("bukti-bayar")
          .upload(path, file, { upsert: false });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("bukti-bayar").getPublicUrl(path);
        buktiUrl = data.publicUrl;
      }
      const payload = {
        tanggal,
        tipe,
        nominal: nominal,
        keterangan: keterangan || null,
        sumber_donasi_id: tipe === "pemasukan" ? sumberId || null : null,
        seksi_id: tipe === "pengeluaran" ? seksiId || null : null,
        donor_nama: donorNama
          ? `${donorNama.replace(/ \[(Pria|Wanita)\]/g, "").trim()} [${donorGender}]`
          : null,
        kode: kode || null,
        status,
        bukti_bayar_url: buktiUrl,
      };
      const { error } = initial
        ? await supabase.from("transaksi").update(payload).eq("id", initial.id)
        : await supabase.from("transaksi").insert(payload);
      if (error) throw error;
      toast.success(initial ? "Transaksi diperbarui" : "Transaksi ditambahkan");
      onSaved();
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Transaksi" : "Tambah Transaksi"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Tanggal</Label>
            <Input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
          </div>
          <div>
            <Label>Tipe</Label>
            <Select value={tipe} onValueChange={(v) => setTipe(v as "pemasukan" | "pengeluaran")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pemasukan">Pemasukan</SelectItem>
                <SelectItem value="pengeluaran">Pengeluaran</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {tipe === "pemasukan" ? (
            <>
              <div className="col-span-2">
                <Label>Cabang Asal</Label>
                <Select value={sumberId} onValueChange={setSumberId}>
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
              <div className="col-span-2">
                <Label>Nama Donatur / Jamaah</Label>
                <Input
                  value={donorNama}
                  onChange={(e) => setDonorNama(e.target.value)}
                  placeholder="Nama jamaah"
                />
              </div>
              <div className="col-span-2">
                <Label>Jenis Kelamin Donatur</Label>
                <div className="flex gap-4 items-center mt-1">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      checked={donorGender === "Pria"}
                      onChange={() => {
                        setDonorGender("Pria");
                        setNominal(250000);
                      }}
                      name="adm_gender"
                      className="h-4 w-4"
                    />
                    Pria
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      checked={donorGender === "Wanita"}
                      onChange={() => {
                        setDonorGender("Wanita");
                        setNominal(100000);
                      }}
                      name="adm_gender"
                      className="h-4 w-4"
                    />
                    Wanita
                  </label>
                </div>
              </div>
              <div className="col-span-2">
                <Label>Kode</Label>
                <Input
                  value={kode}
                  onChange={(e) => setKode(e.target.value)}
                  placeholder="opsional"
                />
              </div>
            </>
          ) : (
            <div className="col-span-2">
              <Label>Seksi</Label>
              <Select value={seksiId} onValueChange={setSeksiId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih seksi" />
                </SelectTrigger>
                <SelectContent>
                  {seksi.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label>Nominal (Rp)</Label>
            <NominalInput value={nominal} onChange={setNominal} placeholder="0" />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as TrxStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diterima">Diterima</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="ditolak">Ditolak</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label>Keterangan</Label>
            <Textarea rows={2} value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
          </div>
          <div className="col-span-2">
            <Label>Bukti Bayar</Label>
            <Input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {existingUrl && !file && (
              <a
                href={existingUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-xs text-primary underline"
              >
                Lihat bukti saat ini
              </a>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={submit} disabled={busy}>
            {busy ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
