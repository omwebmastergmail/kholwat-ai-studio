## Tujuan

Membuat halaman `/admin` (tetap terpisah dari halaman publik) menjadi panel manajemen lengkap dengan 5 tab — **Donasi · Seksi · Transaksi · Grafik · Masuk** — yang setara dengan UI referensi `infohbhmdti.my.id`. Halaman publik di `/` tidak diubah pada plan ini.

## Layout Halaman Admin

```text
┌──────────────────────────────────────────────┐
│  Header (sama, + tombol Print All & Keluar)  │
├──────────────────────────────────────────────┤
│  StatsCards: TARGET DONASI │ REALISASI       │
├──────────────────────────────────────────────┤
│  Tabs: Donasi │ Seksi │ Transaksi │ Grafik │ Masuk │
└──────────────────────────────────────────────┘
```

## Fase 1 — Skema Database & Storage

Tambah kolom & tabel baru (lewat migration):

- `transaksi`:
  - `donor_nama TEXT` (untuk donasi masuk individual)
  - `kode TEXT` (kode unik donasi, mis. `SUNDCL6`)
  - `status` ENUM `('pending','diterima','ditolak')` default `diterima`
  - `bukti_bayar_url TEXT` (path file di storage)
- Storage bucket `bukti-bayar` (public read), RLS upload hanya admin
- RLS update/delete `transaksi` sudah admin-only — tetap

## Fase 2 — Tab Donasi & Tab Masuk

**Tab Donasi (Sumber Dana)**
- Card "Sumber Dana Donasi" dengan tombol header **Excel · PDF · Tambah**
- Search bar
- Tabel: No · Sumber Donasi · Nominal (sortable) · **Aksi (edit/hapus)**
- Tombol "Tampilkan lagi (N sisa)" untuk paginate, baris **Total** di bawah

**Tab Masuk (Donasi Masuk per donatur)**
- Tabel: Tanggal · Nama · Nominal · **Status badge** (Diterima/Pending/Ditolak warna hijau/abu/merah) · Aksi expand
- Row expand: Kode, Nama, Sumber, Nominal, Tanggal, Status, **thumbnail Bukti Bayar**
- Form Tambah: nama donatur, sumber, nominal, tanggal, upload bukti bayar, status

## Fase 3 — Tab Transaksi

- Card header dengan tombol **Excel · PDF · Tambah**
- 3 stat card berwarna: **MASUK (hijau) · KELUAR (merah) · SALDO (biru)**
- Search + tombol Filter (filter by tipe/seksi/sumber/tanggal)
- List item dengan nomor bulat, judul keterangan UPPERCASE, tanggal · seksi/sumber, **thumbnail bukti**, edit (hijau), hapus (merah), nominal warna (+hijau/-merah)
- Pagination "Rows: 10 · 1-10 / N"

## Fase 4 — Tab Seksi & Tab Grafik

**Tab Seksi**
- Card header dengan ringkasan: Anggaran · Dana Masuk · Realisasi
- Tombol PDF · Filter
- Tabel: No · Nama Seksi (expand) · Anggaran · Realisasi (+/- selisih) · % (warna hijau ≤100, kuning, merah >100) · edit
- Expand row → list rincian transaksi seksi tsb (keterangan, tanggal, nominal merah)
- Progress bar warna sesuai % di bawah nama seksi
- Baris **Total** di bawah

**Tab Grafik** (pakai recharts)
- Donut **Dana Masuk vs Keluar** + label Saldo
- Donut **Pengeluaran per Seksi** dengan legend persentase
- Donut **Proporsi Donasi per Sumber** dengan legend scrollable + nominal
- Tombol Print PDF

## Detail Teknis

- Komponen baru di `src/components/admin/`: `AdminDonasi.tsx`, `AdminMasuk.tsx`, `AdminTransaksi.tsx`, `AdminSeksi.tsx`, `AdminGrafik.tsx`, plus dialog form (`TransaksiDialog`, `SumberDialog`, `MasukDialog`).
- Reuse `Tabs`, `Table`, `Dialog`, `Badge`, `Progress` dari shadcn.
- Export Excel: `xlsx` (sudah ada deps? cek). Export PDF: `jspdf` + `jspdf-autotable`. Print All: `window.print()` dengan CSS print.
- Upload bukti bayar via `supabase.storage.from('bukti-bayar').upload(...)`.
- Query data via TanStack Query, invalidate setelah mutate.
- Filter & pagination pakai state lokal + `useMemo`.
- Halaman `/` (publik) tidak dimodifikasi — admin punya UI sendiri di `/admin`.

## Eksekusi Bertahap

Setelah plan disetujui, saya kerjakan **Fase 1 dulu** (migration + storage), tunggu approval migration, baru lanjut Fase 2 → 3 → 4 dalam pesan terpisah agar tiap tahap bisa dicek.

## Yang Perlu Dipastikan

- OK menambah kolom `donor_nama`, `kode`, `status`, `bukti_bayar_url` ke `transaksi`?
- OK membuat storage bucket public `bukti-bayar` untuk thumbnail bukti?
- Ada preferensi library export (xlsx + jspdf) atau cukup CSV + window.print?
