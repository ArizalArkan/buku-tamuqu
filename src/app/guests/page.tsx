"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { createGuest, updateGuest, deleteGuest, type GuestInput } from "@/app/actions/guests";
import { Modal } from "@/components/ui/modal";

type Guest = {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  category: "VVIP" | "VIP" | "Regular";
  source?: string;
  table_no?: string | null;
  pax?: number | null;
};

export default function GuestsPage() {
  const [q, setQ] = useState("");
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<GuestInput>({ name: "", phone: "", address: "", category: "Regular", table_no: "", pax: 1 });
  const [editing, setEditing] = useState<Guest | null>(null);
  const [editForm, setEditForm] = useState<GuestInput>({ name: "", phone: "", address: "", category: "Regular", table_no: "", pax: 1 });

  useEffect(() => {
    loadGuests();
    const ch = supabase
      .channel("guests-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "guests" }, loadGuests)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  const loadGuests = async () => {
    const { data, error } = await supabase
      .from("guests")
      .select("id, name, phone, address, category, source, table_no, pax")
      .order("name");
    if (!error) setGuests(data || []);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return guests;
    return guests.filter((g) => g.name.toLowerCase().includes(s));
  }, [q, guests]);

  const onCreate = async () => {
    if (!form.name.trim()) return;
    // optimistic add
    const tempId = `temp-${Date.now()}`;
    const optimistic: Guest = {
      id: tempId,
      name: form.name,
      phone: form.phone,
      address: form.address,
      category: form.category,
      source: form.source,
      table_no: form.table_no,
      pax: typeof form.pax === "number" ? form.pax : Number(form.pax ?? 1),
    };
    setGuests((prev) => [optimistic, ...prev]);
    setShowForm(false);
    setForm({ name: "", phone: "", address: "", category: "Regular", table_no: "", pax: 1 });

    const toCreate: GuestInput = {
      name: optimistic.name,
      phone: optimistic.phone,
      address: optimistic.address,
      category: optimistic.category,
      source: optimistic.source,
      table_no: optimistic.table_no ?? undefined,
      pax: optimistic.pax ?? 1,
    };
    const res = await createGuest(toCreate);
    if (!res.success) {
      // rollback
      setGuests((prev) => prev.filter((g) => g.id !== tempId));
      alert(res.error || "Failed to create");
    } else {
      // replace temp with real
      setGuests((prev) => [res.data as Guest, ...prev.filter((g) => g.id !== tempId)]);
    }
  };

  const onDelete = async (id: string) => {
    const prev = guests;
    setGuests((g) => g.filter((x) => x.id !== id));
    const res = await deleteGuest(id);
    if (!res.success) {
      setGuests(prev); // rollback
      alert(res.error || "Failed to delete");
    }
  };

  const openEdit = (g: Guest) => {
    setEditing(g);
    setEditForm({
      name: g.name,
      phone: g.phone,
      address: g.address,
      category: g.category,
      table_no: g.table_no ?? "",
      pax: g.pax ?? 1,
    });
  };

  const onUpdate = async () => {
    if (!editing) return;
    const id = editing.id;
    const prev = guests;

    // optimistic update
    setGuests((gs) =>
      gs.map((x) =>
        x.id === id
          ? { ...x, ...editForm, table_no: editForm.table_no || null }
          : x
      )
    );

    setEditing(null);

    const res = await updateGuest(id, {
      name: editForm.name,
      phone: editForm.phone,
      address: editForm.address,
      category: editForm.category,
      table_no: editForm.table_no || undefined,
      pax: typeof editForm.pax === "number" ? editForm.pax : Number(editForm.pax ?? 1),
    });

    if (!res.success) {
      // rollback
      setGuests(prev);
      alert(res.error || "Failed to update");
    }
  };

  // CSV Import/Export removed as requested

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Data Tamu</h2>
        <div className="text-sm text-slate-500">Total: {guests.length}</div>
      </div>

      <Card className="bg-white shadow-sm">
        <CardContent className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-2">
            <Input placeholder="Cari nama tamu..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Button className="bg-slate-900" onClick={() => setShowForm(true)}>+ Tambah Tamu</Button>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit form (simple modal substitute) */}
      {showForm && (
        <Card className="bg-white shadow-sm">
          <CardContent className="grid gap-3 p-4 md:grid-cols-6">
            <Input className="md:col-span-2" placeholder="Nama" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input className="md:col-span-2" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input className="md:col-span-2" placeholder="Alamat" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <div className="md:col-span-2">
              <select className="w-full border rounded-md px-3 py-2 text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as any })}>
                <option value="VVIP">VVIP</option>
                <option value="VIP">VIP</option>
                <option value="Regular">Regular</option>
              </select>
            </div>
            <Input type="number" min={1} className="md:col-span-1" placeholder="Pax" value={form.pax ?? 1} onChange={(e) => setForm({ ...form, pax: Math.max(1, Number(e.target.value) || 1) })} />
            <Input className="md:col-span-1" placeholder="No Meja" value={form.table_no} onChange={(e) => setForm({ ...form, table_no: e.target.value })} />
            <div className="flex gap-2 md:col-span-6">
              <Button className="bg-slate-900" onClick={onCreate}>Simpan</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white shadow-sm">
        <CardContent className="p-0 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-slate-600">
              <tr>
                <th className="px-3 py-2 text-left">No</th>
                <th className="px-3 py-2 text-left">Nama Tamu</th>
                <th className="px-3 py-2 text-left">Alamat</th>
                <th className="px-3 py-2 text-left">Kategori</th>
                <th className="px-3 py-2 text-left">Pax</th>
                <th className="px-3 py-2 text-left">No Meja</th>
                <th className="px-3 py-2 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-slate-500">Loading...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-slate-500">No guests</td>
                </tr>
              ) : (
                filtered.map((g, i) => (
                  <tr key={g.id} className="border-t">
                    <td className="px-3 py-2">{i + 1}</td>
                    <td className="px-3 py-2">
                      <div className="font-medium">{g.name}</div>
                      {g.phone && <div className="text-xs text-slate-500">{g.phone}</div>}
                    </td>
                    <td className="px-3 py-2">{g.address || '-'}</td>
                    <td className="px-3 py-2">
                      <Badge variant="secondary">{g.category}</Badge>
                    </td>
                    <td className="px-3 py-2">{g.pax ?? 1}</td>
                    <td className="px-3 py-2">{g.table_no || '-'}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2 text-slate-600">
                        <button className="underline" onClick={() => openEdit(g)}>Edit</button>
                        <button className="underline text-red-600" onClick={() => onDelete(g.id)}>Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit Tamu"
        footer={[
          <Button key="cancel" variant="outline" onClick={() => setEditing(null)}>Batal</Button>,
          <Button key="save" className="bg-slate-900" onClick={onUpdate}>Simpan</Button>,
        ]}
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Input placeholder="Nama" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
          <Input placeholder="Phone" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
          <Input placeholder="Alamat" className="md:col-span-2" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
          <div>
            <select className="w-full border rounded-md px-3 py-2 text-sm" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value as any })}>
              <option value="VVIP">VVIP</option>
              <option value="VIP">VIP</option>
              <option value="Regular">Regular</option>
            </select>
          </div>
          <Input type="number" min={1} placeholder="Pax" value={editForm.pax ?? 1} onChange={(e) => setEditForm({ ...editForm, pax: Math.max(1, Number(e.target.value) || 1) })} />
          <Input placeholder="No Meja" value={editForm.table_no} onChange={(e) => setEditForm({ ...editForm, table_no: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}
