import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Wallet,
  UserCheck,
  Phone,
  FileText,
  Download,
  Copy,
  Check,
  Landmark,
  ArrowRight,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => new Date());
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, target.getTime() - now.getTime());
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s, isClient };
}

const pad = (n: number) => String(n).padStart(2, "0");

export function SuratEdaranTab() {
  // 10 Juli 2026, 13:30 WIB (UTC+7)
  const target = new Date("2026-07-10T13:30:00+07:00");
  const { d, h, m, s, isClient } = useCountdown(target);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section
        className="rounded-2xl p-8 text-center text-primary-foreground shadow-md sm:p-12"
        style={{ background: "var(--gradient-header)" }}
      >
        <p className="text-base sm:text-lg" style={{ color: "oklch(0.85 0.13 85)" }}>
          بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيْمِ
        </p>
        <p className="mt-3 text-sm opacity-90 sm:text-base">Assalaamu'alaikum Wr. Wb.</p>
        <h2 className="mt-3 text-3xl font-bold sm:text-5xl">Kholwat</h2>
        <p
          className="mt-2 text-2xl font-semibold sm:text-4xl"
          style={{ color: "oklch(0.85 0.15 85)" }}
        >
          1448 H / 2026 M
        </p>
        <p className="mt-3 text-sm opacity-90 sm:text-base">Majelis Dzikir Tasbih Indonesia</p>
        <div className="mx-auto my-5 flex max-w-xs items-center gap-3">
          <div className="h-px flex-1 bg-white/30" />
          <span className="text-amber-300">◆</span>
          <div className="h-px flex-1 bg-white/30" />
        </div>
        <p className="mx-auto max-w-2xl text-sm italic opacity-95 sm:text-base">
          "Bersama Kita Bisa, Bersatu Kita Mampu."
        </p>
        <p className="mt-2 text-xs opacity-80">— Kanjeng Guru</p>
      </section>

      {/* Countdown */}
      <section
        className="relative overflow-hidden rounded-2xl p-6 text-primary-foreground shadow-lg sm:p-8"
        style={{ background: "var(--gradient-header)" }}
      >
        {/* decorative glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: "oklch(0.85 0.15 85 / 0.25)" }}
        />
        <div className="relative">
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-white/30" />
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-200 sm:text-xs">
              Hitung Mundur Menuju Hari H
            </p>
            <span className="h-px w-8 bg-white/30" />
          </div>

          <div className="mt-6 grid grid-cols-4 gap-2 sm:gap-4">
            {[
              { v: d, l: "Hari" },
              { v: h, l: "Jam" },
              { v: m, l: "Menit" },
              { v: s, l: "Detik" },
            ].map((u) => (
              <div
                key={u.l}
                className="rounded-2xl border border-white/15 bg-white/10 px-1 py-3 text-center shadow-inner backdrop-blur-sm sm:px-3 sm:py-5"
              >
                <div className="font-bold tabular-nums leading-none text-white text-[2.25rem] sm:text-6xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
                  {isClient ? pad(u.v) : "00"}
                </div>
                <div className="mt-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-amber-200/90 sm:mt-3 sm:text-[11px]">
                  {u.l}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-5 text-center text-[11px] text-white/70 sm:text-xs">
            Jum'at, 10 Juli 2026 · Pukul 13:30 WIB
          </p>
        </div>
      </section>

      {/* Detail Acara */}
      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <DetailRow
          icon={<Calendar className="h-5 w-5" />}
          label="Hari / Tanggal"
          title="Jum'at s/d Ahad"
          subtitle="25 – 27 Muharram 1448 H · 10 – 12 Juli 2026"
        />
        <Divider />
        <DetailRow
          icon={<Clock className="h-5 w-5" />}
          label="Pembukaan"
          title="Jum'at, 10 Juli 2026"
          subtitle="Pukul 13:30 WIB"
        />
        <Divider />
        <DetailRow
          icon={<MapPin className="h-5 w-5" />}
          label="Tempat"
          title="Desa Jatirunggo"
          subtitle="Kec. Pringapus, Kab. Semarang"
        />
        <Divider />
        <DetailRow
          icon={<UserCheck className="h-5 w-5" />}
          label="Pendaftaran Terakhir"
          title="Ahad, 21 Juni 2026"
          subtitle="Data peserta sudah masuk ke Sekretariat Panitia"
        />
      </section>

      {/* Biaya Kontribusi */}
      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Biaya Kontribusi</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border bg-accent/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Jamaah Pria
            </p>
            <p className="mt-1 text-2xl font-bold text-primary">Min. Rp 250.000</p>
            <p className="mt-1 text-xs text-muted-foreground">Dua Ratus Lima Puluh Ribu Rupiah</p>
          </div>
          <div className="rounded-xl border bg-accent/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Jamaah Wanita
            </p>
            <p className="mt-1 text-2xl font-bold text-primary">Min. Rp 100.000</p>
            <p className="mt-1 text-xs text-muted-foreground">Seratus Ribu Rupiah</p>
          </div>
        </div>
        <p className="mt-4 rounded-lg bg-muted/60 p-3 text-sm italic text-muted-foreground">
          Penyetoran kontribusi Kholwat dikoordinir Pengurus Cabang karena berkaitan dengan
          identifikasi <span className="font-medium">Pro Aktif Revolusi Tasbih</span>. Besar uang
          transfer, jumlah peserta, dan asal Cabang mohon dikonfirmasikan melalui WhatsApp kepada
          panitia.
        </p>
      </section>

      {/* Informasi Pembayaran */}
      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Landmark className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Informasi Pembayaran</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Silakan transfer kontribusi melalui rekening berikut:
        </p>
        <div className="mt-4 rounded-xl border bg-accent/40 p-4">
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
            <CopyButton value="609401014135505" label="Salin No. Rekening" />
          </div>
        </div>
        <div className="mt-4 rounded-lg bg-muted/60 p-4">
          <p className="text-sm text-muted-foreground">
            Setelah transfer, mohon konfirmasi pembayaran melalui form berikut:
          </p>
          <Link
            to="/donasi"
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90"
          >
            Isi Form Konfirmasi Donasi <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Phone className="h-5 w-5 text-primary" /> Hubungi Panitia
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <ContactCard
            name="Sdr. Eka Wahyudi"
            role="Ketua Panitia Kholwat 2026"
            phone="0857-2781-8748"
          />
          <ContactCard
            name="Sdr. Rudianto"
            role="Bendahara Panitia Kholwat 2026"
            phone="0895-3533-70204"
          />
        </div>
      </section>

      {/* Ketentuan Peserta */}
      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <FileText className="h-5 w-5 text-primary" /> Ketentuan Peserta
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Yang dapat menjadi peserta Kholwat tahun 2026 adalah peserta Kholwat tahun 2025 yang pro
          aktif menjaga Jariyah Bulanan / Back Up Jariyah sesuai kesanggupan, berwakaf atau mencari
          wakaf, aktif Wuulll <span className="font-semibold underline">atau</span> tidak ikut
          Kholwat tahun 2025 tetapi sudah Pro Aktif Revolusi (Jariyah Bulanan / Back Up Jariyah,
          Wakaf, Wuulll) mulai <span className="font-semibold">Januari 2020</span> sampai
          pelaksanaan Kholwat 2026.
        </p>
      </section>

      {/* Footer surat */}
      <section className="rounded-2xl border bg-card p-6 text-center shadow-sm">
        <p className="text-sm italic text-muted-foreground">Wassalaamu'alaikum Wr. Wb.</p>
        <p className="mt-3 text-sm">Semarang, 11 Mei 2026</p>
        <p className="mt-1 text-sm font-semibold">Pengurus Pusat</p>
        <p className="text-sm font-semibold">Yayasan Majelis Dzikir Tasbih Indonesia</p>
        <p className="mt-4 text-xs text-muted-foreground">No. Surat Edaran: 004/SE/MDTI.0/V/2026</p>
        <a
          href="/surat-edaran-kholwat-2026.pdf"
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90"
        >
          <Download className="h-4 w-4" /> Unduh PDF Surat Edaran
        </a>
      </section>
    </div>
  );
}

function Divider() {
  return <div className="my-4 h-px bg-border" />;
}

function DetailRow({
  icon,
  label,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-base font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function ContactCard({ name, role, phone }: { name: string; role: string; phone: string }) {
  const wa = `https://wa.me/62${phone.replace(/[^0-9]/g, "").replace(/^0/, "")}`;
  return (
    <div className="rounded-xl border bg-accent/30 p-4">
      <p className="text-base font-semibold">{name}</p>
      <p className="text-xs text-muted-foreground">{role}</p>
      <p className="mt-2 text-sm tabular-nums">{phone}</p>
      <a
        href={wa}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
      >
        <Phone className="h-3.5 w-3.5" /> WhatsApp
      </a>
    </div>
  );
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Nomor rekening disalin");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin");
    }
  };
  return (
    <button
      onClick={onCopy}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border bg-background px-3 py-2 text-xs font-semibold shadow-sm hover:bg-accent"
      aria-label={label}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
      <span className="hidden sm:inline">{copied ? "Tersalin" : "Salin"}</span>
    </button>
  );
}
