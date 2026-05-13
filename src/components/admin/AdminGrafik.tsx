import { useMemo } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/format";
import type { Seksi, Sumber, Trx } from "@/lib/admin-types";

const PALETTE = [
  "#1f6f4a",
  "#3b82f6",
  "#f59e0b",
  "#a855f7",
  "#ef4444",
  "#10b981",
  "#0ea5e9",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#6366f1",
  "#84cc16",
  "#eab308",
  "#06b6d4",
];

export function AdminGrafik({
  sumber,
  seksi,
  trx,
}: {
  sumber: Sumber[];
  seksi: Seksi[];
  trx: Trx[];
}) {
  const masuk = trx
    .filter((t) => t.tipe === "pemasukan" && t.status === "diterima")
    .reduce((a, t) => a + Number(t.nominal), 0);
  const keluar = trx
    .filter((t) => t.tipe === "pengeluaran")
    .reduce((a, t) => a + Number(t.nominal), 0);
  const saldo = masuk - keluar;

  const seksiData = useMemo(
    () =>
      seksi
        .map((s) => ({
          name: s.nama,
          value: trx
            .filter((t) => t.seksi_id === s.id && t.tipe === "pengeluaran")
            .reduce((a, t) => a + Number(t.nominal), 0),
        }))
        .filter((s) => s.value > 0)
        .sort((a, b) => b.value - a.value),
    [seksi, trx],
  );

  const sumberData = useMemo(
    () =>
      sumber
        .map((s) => ({
          name: s.nama,
          value: trx
            .filter(
              (t) =>
                t.sumber_donasi_id === s.id && t.tipe === "pemasukan" && t.status === "diterima",
            )
            .reduce((a, t) => a + Number(t.nominal), 0),
        }))
        .filter((s) => s.value > 0)
        .sort((a, b) => b.value - a.value),
    [sumber, trx],
  );

  const totalSeksi = seksiData.reduce((a, s) => a + s.value, 0);
  const totalSumber = sumberData.reduce((a, s) => a + s.value, 0);

  const flowData = [
    { name: "Dana Masuk", value: masuk },
    { name: "Dana Keluar", value: keluar },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="text-red-600" onClick={() => window.print()}>
          <Printer className="mr-1 h-4 w-4" /> Print PDF
        </Button>
      </div>

      <ChartCard title="Dana Masuk vs Keluar" dot="bg-emerald-500">
        <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2">
          <div className="relative h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={flowData} dataKey="value" innerRadius={50} outerRadius={80}>
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip formatter={(v: number) => formatRupiah(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="text-xs text-muted-foreground">Total</div>
              <div className="text-base font-bold">
                {(masuk + keluar) / 1_000_000 < 1000
                  ? `${((masuk + keluar) / 1_000_000).toFixed(1)}jt`
                  : formatRupiah(masuk + keluar)}
              </div>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 h-3 w-3 rounded-full bg-emerald-500" />
              <div>
                <div className="text-muted-foreground">Dana Masuk</div>
                <div className="font-bold text-emerald-600">{formatRupiah(masuk)}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-0.5 h-3 w-3 rounded-full bg-red-500" />
              <div>
                <div className="text-muted-foreground">Dana Keluar</div>
                <div className="font-bold text-red-600">{formatRupiah(keluar)}</div>
              </div>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-muted-foreground">Saldo</span>
              <b className="text-blue-600">{formatRupiah(saldo)}</b>
            </div>
          </div>
        </div>
      </ChartCard>

      <ChartCard title="Pengeluaran Per Seksi" dot="bg-violet-500">
        <DonutWithLegend data={seksiData} total={totalSeksi} />
      </ChartCard>

      <ChartCard title="Proporsi Donasi Per Sumber" dot="bg-amber-500">
        <DonutWithLegend data={sumberData} total={totalSumber} showRupiah />
      </ChartCard>
    </div>
  );
}

function ChartCard({
  title,
  dot,
  children,
}: {
  title: string;
  dot: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className={`h-3 w-3 rounded-full ${dot}`} />
        <h3 className="font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function DonutWithLegend({
  data,
  total,
  showRupiah,
}: {
  data: { name: string; value: number }[];
  total: number;
  showRupiah?: boolean;
}) {
  if (data.length === 0)
    return <p className="py-8 text-center text-sm text-muted-foreground">Belum ada data</p>;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="relative h-64">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={55} outerRadius={90}>
              {data.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v: number) => formatRupiah(v)} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-xs text-muted-foreground">Total</div>
          <div className="text-base font-bold">{(total / 1_000_000).toFixed(1)}jt</div>
        </div>
      </div>
      <div className="max-h-64 space-y-1.5 overflow-y-auto pr-2 text-xs">
        {data.map((d, i) => {
          const pct = total > 0 ? (d.value / total) * 100 : 0;
          return (
            <div key={d.name} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: PALETTE[i % PALETTE.length] }}
              />
              <span className="flex-1 truncate text-muted-foreground">{d.name}</span>
              <span className="shrink-0 font-semibold">{pct.toFixed(1)}%</span>
              {showRupiah && (
                <span className="w-24 shrink-0 text-right tabular-nums text-muted-foreground">
                  {formatRupiah(d.value)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
