export type Sumber = { id: string; nama: string; urutan: number };
export type Seksi = { id: string; nama: string; rencana_anggaran: number; urutan: number };
export type TrxStatus = "pending" | "diterima" | "ditolak";
export type Trx = {
  id: string;
  tanggal: string;
  tipe: "pemasukan" | "pengeluaran";
  nominal: number;
  keterangan: string | null;
  sumber_donasi_id: string | null;
  seksi_id: string | null;
  donor_nama: string | null;
  kode: string | null;
  status: TrxStatus;
  bukti_bayar_url: string | null;
  created_at?: string;
};
