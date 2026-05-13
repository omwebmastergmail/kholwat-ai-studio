import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SeksiRow } from "./SeksiTab";
import type { SumberRow } from "./DonasiTab";
import { formatRupiah } from "@/lib/format";

const COLORS = [
  "#1f6f4a",
  "#2d8a5c",
  "#3da66f",
  "#4ec282",
  "#62cf94",
  "#7adba6",
  "#94e7b8",
  "#b0f1cb",
  "#1e5a3f",
  "#256e4d",
];

export function GrafikTab({ seksi, sumber }: { seksi: SeksiRow[]; sumber: SumberRow[] }) {
  const seksiData = seksi.map((s) => ({
    name: s.nama,
    Rencana: s.rencana,
    Realisasi: s.realisasi,
  }));
  const sumberData = sumber
    .filter((s) => s.nominal > 0)
    .map((s) => ({ name: s.nama, value: s.nominal }));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
        <h2 className="mb-1 text-lg font-semibold">Rencana vs Realisasi per Seksi</h2>
        <p className="mb-4 text-sm text-muted-foreground">Anggaran dan pengeluaran tiap seksi</p>
        <div className="h-80 w-full">
          <ResponsiveContainer>
            <BarChart data={seksiData} margin={{ top: 10, right: 10, left: 0, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" angle={-30} textAnchor="end" height={70} fontSize={11} />
              <YAxis fontSize={11} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`} />
              <Tooltip formatter={(v: number) => formatRupiah(v)} />
              <Legend />
              <Bar dataKey="Rencana" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Realisasi" fill="var(--color-primary-glow)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
        <h2 className="mb-1 text-lg font-semibold">Komposisi Sumber Donasi</h2>
        <p className="mb-4 text-sm text-muted-foreground">Distribusi penerimaan per sumber</p>
        <div className="h-80 w-full">
          {sumberData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Belum ada penerimaan
            </div>
          ) : (
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={sumberData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label={(e) => e.name}
                >
                  {sumberData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatRupiah(v)} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
