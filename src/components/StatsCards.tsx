import { Target, TrendingUp, Users } from "lucide-react";
import { formatRupiah } from "@/lib/format";

export function StatsCards({
  target,
  realisasi,
  pria = 0,
  wanita = 0,
}: {
  target: number;
  realisasi: number;
  pria?: number;
  wanita?: number;
}) {
  const persen = target > 0 ? Math.round((realisasi / target) * 100) : 0;
  const totalJamaah = pria + wanita;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div
        className="rounded-2xl p-5 text-primary-foreground shadow-[var(--shadow-card)]"
        style={{ background: "var(--gradient-target)" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            <Target className="h-5 w-5" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider opacity-90">
            Target Donasi
          </span>
        </div>
        <p className="mt-4 text-2xl font-bold sm:text-3xl">{formatRupiah(target)}</p>
      </div>
      <div
        className="rounded-2xl p-5 text-primary-foreground shadow-[var(--shadow-card)]"
        style={{ background: "var(--gradient-realisasi)" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            <TrendingUp className="h-5 w-5" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider opacity-90">
            Realisasi
          </span>
        </div>
        <p className="mt-4 text-2xl font-bold sm:text-3xl">{formatRupiah(realisasi)}</p>
        <p className="mt-1 text-sm opacity-90">
          {persen}% {persen >= 100 ? "- Tercapai" : "- Tercapai"}
        </p>
      </div>
      <div className="rounded-2xl p-5 text-primary-foreground shadow-[var(--shadow-card)] bg-primary">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            <Users className="h-5 w-5" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider opacity-90">
            Total Peserta
          </span>
        </div>
        <p className="mt-4 text-2xl font-bold sm:text-3xl">
          {totalJamaah} <span className="text-sm font-normal">Orang</span>
        </p>
        <p className="mt-1 text-sm opacity-90">
          Pria: {pria} • Wanita: {wanita}
        </p>
      </div>
    </div>
  );
}
