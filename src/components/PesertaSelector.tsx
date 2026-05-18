import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

type Peserta = { id: string; nama: string; jenis_kelamin: string | null };

export function PesertaSelector({
  pesertaList,
  selectedIds,
  onSelect,
  onAddNew,
}: {
  pesertaList: Peserta[];
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
  onAddNew: (nama: string, jk: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newNama, setNewNama] = useState("");
  const [newJk, setNewJk] = useState<"pria" | "wanita">("pria");

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelect(selectedIds.filter((x) => x !== id));
    } else {
      onSelect([...selectedIds, id]);
    }
  };

  const handleAdd = () => {
    if (!newNama.trim()) return;
    onAddNew(newNama.trim(), newJk);
    setAddOpen(false);
    setNewNama("");
    setNewJk("pria");
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between sm:w-[300px]"
            >
              Pilih Peserta...
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Cari peserta..." />
              <CommandList>
                <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                <CommandGroup>
                  {pesertaList.map((p) => (
                    <CommandItem key={p.id} value={p.nama} onSelect={() => toggle(p.id)}>
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedIds.includes(p.id) ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {p.nama} {p.jenis_kelamin === "wanita" ? "(P)" : "(L)"}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Peserta Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label>Nama</Label>
                <Input value={newNama} onChange={(e) => setNewNama(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Jenis Kelamin</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      checked={newJk === "pria"}
                      onChange={() => setNewJk("pria")}
                    />{" "}
                    Pria
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      checked={newJk === "wanita"}
                      onChange={() => setNewJk("wanita")}
                    />{" "}
                    Wanita
                  </label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                Batal
              </Button>
              <Button type="button" onClick={handleAdd}>
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
