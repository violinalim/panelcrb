import { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Plus } from "lucide-react";
import { AdminUser } from "@/types";
import { toast } from "sonner";

export default function AdminSection() {
  const [entries, setEntries] = useState<AdminUser[]>([]);
  const [formData, setFormData] = useState<AdminUser>({
    username: "",
    email: "",
    divisi: "",
    keterangan: "",
  });
  const [password, setPassword] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "admins"));
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AdminUser[];
      setEntries(data);
    } catch (error) {
      toast.error("Gagal memuat data admin");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, "admins", editingId), { ...formData } as any);
        toast.success("Admin berhasil diupdate");
      } else {
        // Create Firebase Auth user first
        if (!password) {
          toast.error("Password harus diisi untuk admin baru");
          return;
        }
        
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, password);
        
        // Then add to admins collection
        await addDoc(collection(db, "admins"), {
          ...formData,
          firebaseUid: userCredential.user.uid,
          createdAt: new Date()
        });
        
        toast.success("Admin berhasil ditambahkan ke Firebase");
      }
      resetForm();
      fetchEntries();
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        toast.error("Email sudah digunakan");
      } else {
        toast.error("Gagal menyimpan admin");
      }
    }
  };

  const handleEdit = (entry: AdminUser) => {
    setFormData(entry);
    setEditingId(entry.id || null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Yakin ingin menghapus admin ini? User Firebase tidak akan dihapus.")) {
      try {
        await deleteDoc(doc(db, "admins", id));
        toast.success("Admin berhasil dihapus dari database");
        fetchEntries();
      } catch (error) {
        toast.error("Gagal menghapus admin");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      divisi: "",
      keterangan: "",
    });
    setPassword("");
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Table */}
      <div className="bg-cosmic-panel/80 backdrop-blur-xl rounded-2xl p-6 border border-border/50">
        <h2 className="text-xl font-bold text-neon-purple mb-4">Daftar Admin</h2>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Divisi</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead>Tanggal Dibuat</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.username}</TableCell>
                  <TableCell>{entry.email}</TableCell>
                  <TableCell>{entry.divisi}</TableCell>
                  <TableCell>{entry.keterangan}</TableCell>
                  <TableCell>
                    {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString("id-ID") : "-"}
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
          {editingId ? "Edit Admin" : "Tambah Admin Baru"}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Username</Label>
            <Input
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={!!editingId}
            />
          </div>
          {!editingId && (
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Minimal 6 karakter"
              />
            </div>
          )}
          <div>
            <Label>Divisi</Label>
            <Input
              value={formData.divisi}
              onChange={(e) => setFormData({ ...formData, divisi: e.target.value })}
              placeholder="Contoh: Marketing, Customer Service"
              required
            />
          </div>
          <div className="md:col-span-2">
            <Label>Keterangan</Label>
            <Input
              value={formData.keterangan}
              onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
              placeholder="Catatan tambahan"
            />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <Button type="submit" className="gradient-neon">
              <Plus className="h-4 w-4 mr-2" />
              {editingId ? "Update" : "Tambah Admin"}
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
