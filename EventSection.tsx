import { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Plus, Send } from "lucide-react";
import { EventEntry } from "@/types";
import { toast } from "sonner";

export default function EventSection() {
  const [entries, setEntries] = useState<EventEntry[]>([]);
  const [formData, setFormData] = useState<EventEntry>({
    judulEvent: "",
    deskripsi: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "events"));
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EventEntry[];
      setEntries(data);
    } catch (error) {
      toast.error("Gagal memuat data event");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, "events", editingId), { ...formData } as any);
        toast.success("Event berhasil diupdate");
      } else {
        await addDoc(collection(db, "events"), {
          ...formData,
          createdAt: new Date()
        });
        toast.success("Event berhasil ditambahkan");
      }
      resetForm();
      fetchEntries();
    } catch (error) {
      toast.error("Gagal menyimpan event");
    }
  };

  const handleEdit = (entry: EventEntry) => {
    setFormData(entry);
    setEditingId(entry.id || null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Yakin ingin menghapus event ini?")) {
      try {
        await deleteDoc(doc(db, "events", id));
        toast.success("Event berhasil dihapus");
        fetchEntries();
      } catch (error) {
        toast.error("Gagal menghapus event");
      }
    }
  };

  const handleSendToMembers = async (entry: EventEntry) => {
    // In real implementation, this would send to Firebase messaging or push notification
    toast.success(`Event "${entry.judulEvent}" akan dikirim ke semua member`);
  };

  const resetForm = () => {
    setFormData({
      judulEvent: "",
      deskripsi: "",
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Table */}
      <div className="bg-cosmic-panel/80 backdrop-blur-xl rounded-2xl p-6 border border-border/50">
        <h2 className="text-xl font-bold text-neon-purple mb-4">Daftar Event</h2>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul Event</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Tanggal Dibuat</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.judulEvent}</TableCell>
                  <TableCell className="max-w-md truncate">{entry.deskripsi}</TableCell>
                  <TableCell>
                    {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString("id-ID") : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSendToMembers(entry)}
                        title="Kirim ke Member"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
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
          {editingId ? "Edit Event" : "Tambah Event Baru"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Judul Event</Label>
            <Input
              value={formData.judulEvent}
              onChange={(e) => setFormData({ ...formData, judulEvent: e.target.value })}
              placeholder="Contoh: Turnamen Spesial Ramadan"
              required
            />
          </div>
          <div>
            <Label>Deskripsi</Label>
            <Textarea
              value={formData.deskripsi}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              placeholder="Jelaskan detail event..."
              rows={4}
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="gradient-neon">
              <Plus className="h-4 w-4 mr-2" />
              {editingId ? "Update" : "Tambah Event"}
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
