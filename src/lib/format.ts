export function formatRupiah(n: number | string | null | undefined): string {
  const num = Number(n ?? 0);
  return "Rp " + num.toLocaleString("id-ID");
}

export function formatTanggal(d: string | null | undefined): string {
  if (!d) return "-";
  const date = new Date(d);
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}
