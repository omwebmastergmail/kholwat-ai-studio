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
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Sumber } from "@/lib/admin-types";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Sumber | null;
  onSaved: () => void;
}

export function SumberDialog({ open, onOpenChange, initial, onSaved }: Props) {
  const [nama, setNama] = useState("");
  const [urutan, setUrutan] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setNama(initial?.nama ?? "");
    setUrutan(initial?.urutan ?? 0);
  }, [open, initial]);

  const submit = async () => {
    if (!nama.trim()) return toast.error("Nama wajib diisi");
    setBusy(true);
    const payload = { nama: nama.trim(), urutan };
    const { error } = initial
      ? await supabase.from("sumber_donasi").update(payload).eq("id", initial.id)
      : await supabase.from("sumber_donasi").insert(payload);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Tersimpan");
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Sumber" : "Tambah Sumber"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Nama Sumber</Label>
            <Input
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="mis. SEMARANG - PUSAT"
            />
          </div>
          <div>
            <Label>Urutan</Label>
            <Input
              type="number"
              value={urutan}
              onChange={(e) => setUrutan(Number(e.target.value))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={submit} disabled={busy}>
            {busy ? "..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
