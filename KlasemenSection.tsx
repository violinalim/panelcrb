import { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, Download, Upload, Plus } from "lucide-react";
import { KlasemenEntry } from "@/types";
import { toast } from "sonner";

export default function KlasemenSection() {
  const [entries, setEntries] = useState<KlasemenEntry[]>([]);
  const [formData, setFormData] = useState<KlasemenEntry>({
    top: 0,
    userId: "",
    winloss: 0,
    turnover: 0,
    hadiah: "",
    catatan: "",
    keterangan: "Aktif",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "klasemen"));
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as KlasemenEntry[];
      setEntries(data.sort((a, b) => a.top - b.top));
    } catch (error) {
      toast.error("Gagal memuat data klasemen");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, "klasemen", editingId), { ...formData } as any);
        toast.success("Data berhasil diupdate");
      } else {
        await addDoc(collection(db, "klasemen"), {
          ...formData,
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

  const handleEdit = (entry: KlasemenEntry) => {
    setFormData(entry);
    setEditingId(entry.id || null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Yakin ingin menghapus data ini?")) {
      try {
        await deleteDoc(doc(db, "klasemen", id));
        toast.success("Data berhasil dihapus");
        fetchEntries();
      } catch (error) {
        toast.error("Gagal menghapus data");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      top: 0,
      userId: "",
      winloss: 0,
      turnover: 0,
      hadiah: "",
      catatan: "",
      keterangan: "Aktif",
    });
    setEditingId(null);
  };

  const handleExport = () => {
    const csv = [
      ["TOP", "User ID", "Winloss", "TurnOver", "Hadiah", "Catatan", "Keterangan"],
      ...entries.map(e => [e.top, e.userId, e.winloss, e.turnover, e.hadiah, e.catatan, e.keterangan])
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `klasemen_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Data berhasil diexport");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const rows = text.split("\n").slice(1); // Skip header
        
        for (const row of rows) {
          if (!row.trim()) continue;
          const [top, userId, winloss, turnover, hadiah, catatan, keterangan] = row.split(",");
          await addDoc(collection(db, "klasemen"), {
            top: parseInt(top),
            userId: userId.trim(),
            winloss: parseFloat(winloss),
            turnover: parseFloat(turnover),
            hadiah: hadiah.trim(),
            catatan: catatan.trim(),
            keterangan: keterangan.trim() as "Tidak aktif" | "Aktif" | "Expired",
            createdAt: new Date()
          });
        }
        toast.success("Data berhasil diimport");
        fetchEntries();
      } catch (error) {
        toast.error("Gagal mengimport data");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Table */}
      <div className="bg-cosmic-panel/80 backdrop-blur-xl rounded-2xl p-6 border border-border/50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-neon-purple">Data Klasemen</h2>
          <div className="flex gap-2">
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" asChild>
              <label className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Import
                <input type="file" accept=".csv" onChange={handleImport} className="hidden" />
              </label>
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>TOP</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Winloss</TableHead>
                <TableHead>TurnOver</TableHead>
                <TableHead>Hadiah</TableHead>
                <TableHead>Catatan</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.top}</TableCell>
                  <TableCell>{entry.userId}</TableCell>
                  <TableCell>{entry.winloss.toLocaleString()}</TableCell>
                  <TableCell>{entry.turnover.toLocaleString()}</TableCell>
                  <TableCell>{entry.hadiah}</TableCell>
                  <TableCell>{entry.catatan}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      entry.keterangan === "Aktif" ? "bg-green-500/20 text-green-400" :
                      entry.keterangan === "Tidak aktif" ? "bg-red-500/20 text-red-400" :
                      "bg-gray-500/20 text-gray-400"
                    }`}>
                      {entry.keterangan}
                    </span>
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
          {editingId ? "Edit Data" : "Tambah Data Baru"}
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
            <Label>User ID</Label>
            <Input
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Winloss</Label>
            <Input
              type="number"
              value={formData.winloss}
              onChange={(e) => setFormData({ ...formData, winloss: parseFloat(e.target.value) })}
              required
            />
          </div>
          <div>
            <Label>TurnOver</Label>
            <Input
              type="number"
              value={formData.turnover}
              onChange={(e) => setFormData({ ...formData, turnover: parseFloat(e.target.value) })}
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
            <Label>Keterangan</Label>
            <Select
              value={formData.keterangan}
              onValueChange={(value) => setFormData({ ...formData, keterangan: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Aktif">Aktif</SelectItem>
                <SelectItem value="Tidak aktif">Tidak aktif</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label>Catatan</Label>
            <Input
              value={formData.catatan}
              onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
            />
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
