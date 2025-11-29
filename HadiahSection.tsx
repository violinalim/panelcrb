import { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, Plus, Eye, EyeOff } from "lucide-react";
import { HadiahEntry } from "@/types";
import { toast } from "sonner";

export default function HadiahSection() {
  const [entries, setEntries] = useState<HadiahEntry[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [formData, setFormData] = useState<HadiahEntry>({
    top: 0,
    idUsername: "",
    minimalWinloss: 0,
    to: 0,
    hadiah: "",
    hadiahType: "Barang",
    status: "Belum Claim",
    month: "",
    visible: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const currentMonth = new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" });
    setSelectedMonth(currentMonth);
    setFormData(prev => ({ ...prev, month: currentMonth }));
  }, []);

  useEffect(() => {
    if (selectedMonth) {
      fetchEntries();
    }
  }, [selectedMonth]);

  const fetchEntries = async () => {
    try {
      const q = query(collection(db, "hadiah"), where("month", "==", selectedMonth));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HadiahEntry[];
      setEntries(data.sort((a, b) => a.top - b.top));
    } catch (error) {
      toast.error("Gagal memuat data hadiah");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSave = { ...formData, month: selectedMonth };
      if (editingId) {
        await updateDoc(doc(db, "hadiah", editingId), dataToSave as any);
        toast.success("Data berhasil diupdate");
      } else {
        await addDoc(collection(db, "hadiah"), {
          ...dataToSave,
          createdAt: new Date()
        });
        toast.success("Data berhasil ditambahkan");
      }
      resetForm();
      fetchEntries();
    } catch (error) {
      toast.error("Gagal menyimpan data");
    }
  };

  const handleEdit = (entry: HadiahEntry) => {
    setFormData(entry);
    setEditingId(entry.id || null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Yakin ingin menghapus data ini?")) {
      try {
        await deleteDoc(doc(db, "hadiah", id));
        toast.success("Data berhasil dihapus");
        fetchEntries();
      } catch (error) {
        toast.error("Gagal menghapus data");
      }
    }
  };

  const toggleVisibility = async (id: string, currentVisible: boolean) => {
    try {
      await updateDoc(doc(db, "hadiah", id), { visible: !currentVisible } as any);
      toast.success(`Hadiah ${!currentVisible ? "ditampilkan" : "disembunyikan"}`);
      fetchEntries();
    } catch (error) {
      toast.error("Gagal mengubah visibility");
    }
  };

  const resetForm = () => {
    setFormData({
      top: 0,
      idUsername: "",
      minimalWinloss: 0,
      to: 0,
      hadiah: "",
      hadiahType: "Barang",
      status: "Belum Claim",
      month: selectedMonth,
      visible: true,
    });
    setEditingId(null);
  };

  const generateMonths = () => {
    const months = [];
    const startDate = new Date(2025, 10); // November 2025
    for (let i = 0; i < 24; i++) {
      const date = new Date(startDate);
      date.setMonth(startDate.getMonth() + i);
      months.push(date.toLocaleDateString("id-ID", { month: "long", year: "numeric" }));
    }
    return months;
  };

  return (
    <div className="space-y-6">
      {/* Month Selector */}
      <div className="bg-cosmic-panel/80 backdrop-blur-xl rounded-2xl p-6 border border-border/50">
        <Label className="mb-2 block">Pilih Bulan</Label>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-full md:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {generateMonths().map(month => (
              <SelectItem key={month} value={month}>{month}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-cosmic-panel/80 backdrop-blur-xl rounded-2xl p-6 border border-border/50">
        <h2 className="text-xl font-bold text-neon-purple mb-4">
          Data Hadiah - {selectedMonth}
        </h2>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>TOP</TableHead>
                <TableHead>ID Username</TableHead>
                <TableHead>Min Winloss</TableHead>
                <TableHead>TO</TableHead>
                <TableHead>Hadiah</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tampil</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.top}</TableCell>
                  <TableCell>{entry.idUsername}</TableCell>
                  <TableCell>{entry.minimalWinloss.toLocaleString()}</TableCell>
                  <TableCell>{entry.to.toLocaleString()}</TableCell>
                  <TableCell>{entry.hadiah}</TableCell>
                  <TableCell>{entry.hadiahType}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      entry.status === "Claim" ? "bg-green-500/20 text-green-400" :
                      entry.status === "Belum Claim" ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-gray-500/20 text-gray-400"
                    }`}>
                      {entry.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleVisibility(entry.id!, entry.visible)}
                    >
                      {entry.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(entry)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(entry.id!)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-cosmic-panel/80 backdrop-blur-xl rounded-2xl p-6 border border-border/50">
        <h2 className="text-xl font-bold text-neon-purple mb-4">
          {editingId ? "Edit Data" : "Tambah Data Hadiah"}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>TOP</Label>
            <Input
              type="number"
              value={formData.top}
              onChange={(e) => setFormData({ ...formData, top: parseInt(e.target.value) })}
              required
            />
          </div>
          <div>
            <Label>ID Username</Label>
            <Input
              value={formData.idUsername}
              onChange={(e) => setFormData({ ...formData, idUsername: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Minimal Winloss</Label>
            <Input
              type="number"
              value={formData.minimalWinloss}
              onChange={(e) => setFormData({ ...formData, minimalWinloss: parseFloat(e.target.value) })}
              required
            />
          </div>
          <div>
            <Label>TO</Label>
            <Input
              type="number"
              value={formData.to}
              onChange={(e) => setFormData({ ...formData, to: parseFloat(e.target.value) })}
              required
            />
          </div>
          <div>
            <Label>Hadiah</Label>
            <Input
              value={formData.hadiah}
              onChange={(e) => setFormData({ ...formData, hadiah: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Tipe Hadiah</Label>
            <Select
              value={formData.hadiahType}
              onValueChange={(value) => setFormData({ ...formData, hadiahType: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Barang">Barang</SelectItem>
                <SelectItem value="Credit">Credit</SelectItem>
                <SelectItem value="Merchandise">Merchandise</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Claim">Claim</SelectItem>
                <SelectItem value="Belum Claim">Belum Claim</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 flex gap-2">
            <Button type="submit" className="gradient-neon">
              <Plus className="h-4 w-4 mr-2" />
              {editingId ? "Update" : "Tambah"}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Batal
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
