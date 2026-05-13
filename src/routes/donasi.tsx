import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Upload, CheckCircle2, Landmark, Copy, Check, Plus, Trash2 } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NominalInput } from "@/components/admin/NominalInput";
import { toast } from "sonner";

export const Route = createFileRoute("/donasi")({
  head: () => ({
    meta: [
      { title: "Konfirmasi Donasi — Kholwat MDTI 2026" },
      {
        name: "description",
        content:
          "Form konfirmasi donasi Kholwat MDTI 2026. Unggah bukti transfer untuk diverifikasi panitia.",
      },
    ],
  }),
  component: DonasiFormPage,
});

const schema = z.object({
  donor_nama: z.string().trim().min(2, "Nama minimal 2 karakter").max(100),
  sumber_donasi_id: z.string().uuid("Pilih sumber donasi"),
  nominal: z.number().min(1000, "Nominal minimal Rp 1.000"),
  keterangan: z.string().trim().max(500).optional().or(z.literal("")),
});

function DonasiFormPage() {
  const navigate = useNavigate();
  const [sumber, setSumber] = useState<{ id: string; nama: string }[]>([]);
  const [donorNama, setDonorNama] = useState("");
  const [sumberId, setSumberId] = useState("");
  const [nominal, setNominal] = useState<number>(0);
  const [kolektif, setKolektif] = useState<{ nama: string; nominal: number }[]>([]);
  const [keterangan, setKeterangan] = useState("");
  const kolektifSum = kolektif.reduce((s, r) => s + (Number(r.nominal) || 0), 0);
  const isKolektif = kolektif.length > 0;
  const effectiveNominal = isKolektif ? kolektifSum : nominal;
  const [bukti, setBukti] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ kode: string } | null>(null);

  useEffect(() => {
    supabase
      .from("sumber_donasi")
      .select("id, nama")
      .order("urutan")
      .then(({ data }) => setSumber(data ?? []));
  }, []);

  const onFile = (f: File | null) => {
    if (!f) return setBukti(null);
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Ukuran bukti maksimal 5 MB");
      return;
    }
    if (!f.type.startsWith("image/")) {
      toast.error("Bukti harus berupa gambar");
      return;
    }
    setBukti(f);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isKolektif) {
      const invalid = kolektif.some((r) => !r.nama.trim() || !r.nominal || r.nominal <= 0);
      if (invalid) {
        toast.error("Lengkapi nama & nominal setiap baris kolektif");
        return;
      }
    }
    const parsed = schema.safeParse({
      donor_nama: donorNama,
      sumber_donasi_id: sumberId,
      nominal: effectiveNominal,
      keterangan,
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    if (!bukti) {
      toast.error("Mohon unggah bukti transfer");
      return;
    }
    setSubmitting(true);
    try {
      const ext = bukti.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `public/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const up = await supabase.storage
        .from("bukti-bayar")
        .upload(path, bukti, { cacheControl: "3600", upsert: false });
      if (up.error) throw up.error;
      const { data: pub } = supabase.storage.from("bukti-bayar").getPublicUrl(path);

      const kolektifText = isKolektif
        ? "Pembayar Kolektif:\n" +
          kolektif.map((r) => `- ${r.nama.trim()} : ${formatRupiah(r.nominal)}`).join("\n")
        : "";
      const kode = "DN-" + Date.now().toString(36).toUpperCase();
      const { error } = await supabase.from("transaksi").insert({
        tipe: "pemasukan",
        status: "pending",
        tanggal: new Date().toISOString().slice(0, 10),
        donor_nama: parsed.data.donor_nama,
        sumber_donasi_id: parsed.data.sumber_donasi_id,
        nominal: parsed.data.nominal,
        keterangan:
          [kolektifText, parsed.data.keterangan || ""].filter(Boolean).join("\n\n") || null,
        bukti_bayar_url: pub.publicUrl,
        kode,
      });
      if (error) throw error;
      toast.success("Konfirmasi donasi terkirim");
      setDone({ kode });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengirim");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-2xl px-4 py-10">
          <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-9 w-9 text-primary" />
            </div>
            <h1 className="mt-4 text-2xl font-bold">Terima Kasih!</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Konfirmasi donasi Anda telah kami terima dan akan diverifikasi panitia. Setelah
              disetujui, donasi akan tampil pada Data Sumber Donasi.
            </p>
            <div className="mt-4 rounded-lg bg-muted/60 p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Kode Konfirmasi
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums">{done.kode}</p>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button
                onClick={() => {
                  setDone(null);
                  setDonorNama("");
                  setSumberId("");
                  setNominal(0);
                  setKolektif([]);
                  setKeterangan("");
                  setBukti(null);
                }}
                variant="outline"
              >
                Kirim Lagi
              </Button>
              <Button onClick={() => navigate({ to: "/" })}>Kembali ke Beranda</Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>

        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Landmark className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Rekening Tujuan Transfer</h2>
          </div>
          <div className="rounded-xl border bg-accent/40 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Bank BRI
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-primary">
                  6094 0101 4135 505
                </p>
                <p className="mt-1 text-sm">
                  a.n. <span className="font-semibold">Rudianto</span>
                </p>
              </div>
              <CopyBtn value="609401014135505" />
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
          <div>
            <h1 className="text-xl font-bold">Konfirmasi Donasi</h1>
            <p className="text-sm text-muted-foreground">
              Lengkapi form di bawah dan unggah bukti transfer.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nama">Nama Pembayar *</Label>
            <Input
              id="nama"
              required
              maxLength={100}
              value={donorNama}
              onChange={(e) => setDonorNama(e.target.value)}
              placeholder="Nama lengkap pembayar"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label>Nama Pembayar Kolektif</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setKolektif((p) => [...p, { nama: "", nominal: 0 }])}
              >
                <Plus className="h-4 w-4" /> Tambah
              </Button>
            </div>
            {isKolektif ? (
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-xs">
                    <tr>
                      <th className="px-2 py-2 text-left font-medium">Nama</th>
                      <th className="px-2 py-2 text-right font-medium w-40">Nominal</th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {kolektif.map((row, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-1.5">
                          <Input
                            value={row.nama}
                            onChange={(e) =>
                              setKolektif((p) =>
                                p.map((r, i) => (i === idx ? { ...r, nama: e.target.value } : r)),
                              )
                            }
                            placeholder="Nama"
                            className="h-9"
                          />
                        </td>
                        <td className="p-1.5">
                          <NominalInput
                            value={row.nominal}
                            onChange={(v) =>
                              setKolektif((p) =>
                                p.map((r, i) => (i === idx ? { ...r, nominal: v } : r)),
                              )
                            }
                            placeholder="0"
                            className="h-9 text-right"
                          />
                        </td>
                        <td className="p-1.5">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => setKolektif((p) => p.filter((_, i) => i !== idx))}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t bg-muted/30">
                      <td className="px-2 py-2 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Total
                      </td>
                      <td className="px-2 py-2 text-right font-bold tabular-nums">
                        {formatRupiah(kolektifSum)}
                      </td>
                      <td />
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Klik "Tambah" jika pembayaran kolektif (Nama + Nominal per orang). Total otomatis
                terisi ke Nominal.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Sumber Donasi dari Cabang *</Label>
            <Select value={sumberId} onValueChange={setSumberId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih sumber donasi" />
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

          <div className="space-y-2">
            <Label htmlFor="nominal">
              Nominal *
              {isKolektif && (
                <span className="ml-1 text-xs text-muted-foreground">(otomatis dari kolektif)</span>
              )}
            </Label>
            {isKolektif ? (
              <Input
                id="nominal"
                value={formatRupiah(kolektifSum)}
                readOnly
                className="bg-muted/50 font-semibold tabular-nums"
              />
            ) : (
              <NominalInput id="nominal" value={nominal} onChange={setNominal} placeholder="0" />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bukti">Bukti Transfer *</Label>
            <div className="flex items-center gap-3">
              <label
                htmlFor="bukti"
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                <Upload className="h-4 w-4" /> Pilih Gambar
              </label>
              <input
                id="bukti"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => onFile(e.target.files?.[0] ?? null)}
              />
              <span className="text-xs text-muted-foreground">
                {bukti ? bukti.name : "Belum dipilih (max 5 MB)"}
              </span>
            </div>
            {bukti && (
              <img
                src={URL.createObjectURL(bukti)}
                alt="preview"
                className="mt-2 h-32 w-auto rounded border object-cover"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ket">Keterangan</Label>
            <Textarea
              id="ket"
              maxLength={500}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Opsional"
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Mengirim..." : "Kirim Konfirmasi Donasi"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Donasi akan tampil di Data Sumber Donasi setelah diverifikasi panitia.
          </p>
        </form>
      </main>
    </div>
  );
}

function CopyBtn({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Disalin");
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error("Gagal menyalin", e);
    }
  };
  return (
    <button
      type="button"
      onClick={onCopy}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border bg-background px-3 py-2 text-xs font-semibold shadow-sm hover:bg-accent"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
      <span className="hidden sm:inline">{copied ? "Tersalin" : "Salin"}</span>
    </button>
  );
}
