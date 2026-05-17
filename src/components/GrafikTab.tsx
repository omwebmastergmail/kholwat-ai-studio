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
      <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6 overflow-hidden">
        <h2 className="mb-1 text-lg font-semibold">Rencana vs Realisasi per Seksi</h2>
        <p className="mb-4 text-sm text-muted-foreground">Anggaran dan pengeluaran tiap seksi</p>
        <div className="h-80 w-full md:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={seksiData} margin={{ top: 10, right: 10, left: -20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={90}
                fontSize={10}
                interval={0}
              />
              <YAxis
                fontSize={10}
                tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`}
                width={60}
              />
              <Tooltip formatter={(v: number) => formatRupiah(v)} wrapperClassName="text-sm" />
              <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: "20px" }} />
              <Bar dataKey="Rencana" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Realisasi" fill="var(--color-primary-glow)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6 overflow-hidden">
        <h2 className="mb-1 text-lg font-semibold">Komposisi Cabang</h2>
        <p className="mb-4 text-sm text-muted-foreground">Distribusi penerimaan per cabang</p>
        <div className="h-80 w-full md:h-96">
          {sumberData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Belum ada penerimaan
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <Pie
                  data={sumberData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius="80%"
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, value, index }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = 25 + innerRadius + (outerRadius - innerRadius);
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    // Only show label if screen is wide enough or try to fit
                    return (
                      <text
                        x={x}
                        y={y}
                        fill="#666"
                        textAnchor={x > cx ? "start" : "end"}
                        dominantBaseline="central"
                        fontSize={10}
                        className="hidden sm:block"
                      >
                        {sumberData[index].name}
                      </text>
                    );
                  }}
                >
                  {sumberData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatRupiah(v)} wrapperClassName="text-sm" />
                <Legend className="sm:hidden" />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
