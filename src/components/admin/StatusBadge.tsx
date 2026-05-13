import type { TrxStatus } from "@/lib/admin-types";
import { cn } from "@/lib/utils";

const map: Record<TrxStatus, { label: string; cls: string }> = {
  diterima: { label: "Diterima", cls: "bg-emerald-600 text-white" },
  pending: { label: "Pending", cls: "bg-muted text-muted-foreground" },
  ditolak: { label: "Ditolak", cls: "bg-red-600 text-white" },
};

export function StatusBadge({ status }: { status: TrxStatus }) {
  const m = map[status];
  return (
    <span
      className={cn("inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium", m.cls)}
    >
      {m.label}
    </span>
  );
}
