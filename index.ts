export interface KlasemenEntry {
  id?: string;
  top: number;
  userId: string;
  winloss: number;
  turnover: number;
  hadiah: string;
  catatan: string;
  keterangan: "Tidak aktif" | "Aktif" | "Expired";
  createdAt?: Date;
}

export interface HadiahEntry {
  id?: string;
  top: number;
  idUsername: string;
  minimalWinloss: number;
  to: number;
  hadiah: string;
  hadiahType: "Barang" | "Credit" | "Merchandise";
  status: "Claim" | "Belum Claim" | "Expired";
  month: string; // Format: "November 2025"
  visible: boolean;
  createdAt?: Date;
}

export interface EventEntry {
  id?: string;
  judulEvent: string;
  deskripsi: string;
  createdAt?: Date;
}

export interface AdminUser {
  id?: string;
  username: string;
  email: string;
  divisi: string;
  keterangan: string;
  createdAt?: Date;
}
