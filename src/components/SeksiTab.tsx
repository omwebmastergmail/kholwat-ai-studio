import { useState } from "react";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface TrxItem {
  id: string;
  keterangan: string;
  tanggal: string;
  nominal: number;
}

export interface SeksiRow {
  id: string;
  nama: string;
  rencana: number;
  realisasi: number;
  transaksi: TrxItem[];
}

export function SeksiTab({ data }: { data: SeksiRow[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6 mb-8">
      <div className="mb-4 flex flex-col gap-1">
        <h2 className="text-lg font-semibold">Seksi & Anggaran</h2>
        <p className="text-sm text-muted-foreground">
          Rencana anggaran dan realisasi pengeluaran tiap seksi
        </p>
      </div>

      <div className="flex flex-col border rounded-xl overflow-hidden divide-y">
        {data.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">Tidak ada data</div>
        )}
        {data.map((r, i) => {
          const isOpen = expanded === r.id;
          const sisa = r.rencana - r.realisasi;
          const pct = r.rencana > 0 ? (r.realisasi / r.rencana) * 100 : 0;
          const isOver = sisa < 0;

          let pctBg = "bg-emerald-500/10 text-emerald-700";
          let progressBg = "bg-emerald-500";
          if (isOver) {
            pctBg = "bg-red-500/10 text-red-600";
            progressBg = "bg-red-500 [&>div]:bg-red-600"; // tailwind custom to override child nested
          } else if (pct >= 80) {
            pctBg = "bg-amber-500/10 text-amber-600";
            progressBg = "bg-amber-100 [&>div]:bg-amber-500";
          } else {
            pctBg = "bg-emerald-500/10 text-emerald-600";
            progressBg = "bg-emerald-100 [&>div]:bg-emerald-500";
          }

          return (
            <div key={r.id} className="bg-background flex flex-col">
              <div
                className="p-4 sm:p-5 flex flex-col gap-3 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpanded(isOpen ? null : r.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 cursor-pointer">
                    <span className="text-muted-foreground mt-0.5">{i + 1}</span>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-base hover:opacity-80">{r.nama}</h3>
                        {isOpen ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                        <span className="whitespace-nowrap">
                          Anggaran{" "}
                          <span
                            className={cn(
                              "font-medium",
                              r.rencana > 0 ? "text-foreground" : "text-muted-foreground",
                            )}
                          >
                            {r.rencana === 0 ? "-" : formatRupiah(r.rencana)}
                          </span>
                        </span>
                        <span className="text-muted-foreground/30 hidden sm:inline">|</span>
                        <span className="whitespace-nowrap">
                          Realisasi{" "}
                          <span className="font-medium text-foreground">
                            {formatRupiah(r.realisasi)}
                          </span>
                        </span>
                      </div>
                      {isOver && (
                        <div className="text-sm font-medium text-red-600 mt-0.5">
                          Over +{formatRupiah(Math.abs(sisa))}
                        </div>
                      )}
                    </div>
                  </div>

                  {r.rencana > 0 && (
                    <div
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap",
                        pctBg,
                      )}
                    >
                      {Math.round(pct)}%
                    </div>
                  )}
                </div>

                {r.rencana > 0 && (
                  <div className="w-full flex pl-8">
                    <Progress
                      value={Math.min(pct, 100)}
                      className={cn("h-1.5 flex-1", progressBg)}
                    />
                  </div>
                )}
              </div>

              {isOpen && (
                <div className="pl-12 pr-4 pb-5 pt-1">
                  {r.transaksi.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Belum ada pengeluaran.</p>
                  ) : (
                    <ul className="space-y-3">
                      {r.transaksi.map((d) => (
                        <li
                          key={d.id}
                          className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-3 text-sm border-b border-border/50 pb-3 last:border-0 last:pb-0"
                        >
                          <div className="flex items-start sm:items-center justify-between flex-1">
                            <div className="flex items-start sm:items-center flex-1 pr-2">
                              <span className="text-muted-foreground mr-3 mt-1.5 sm:mt-0 text-[8px] shrink-0">
                                ●
                              </span>
                              <span className="text-foreground leading-snug break-words uppercase">
                                {d.keterangan || "-"}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0 mt-0.5 sm:mt-0 text-right w-[4.5rem]">
                              {formatTanggal(d.tanggal).replace(/202\d/, "")}
                            </span>
                          </div>
                          <span className="text-red-500 font-medium whitespace-nowrap tabular-nums pl-5 sm:pl-0 sm:text-right sm:w-28">
                            -{formatRupiah(d.nominal)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
