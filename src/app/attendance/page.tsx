"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { checkInGuest, undoCheckIn } from "@/app/actions/check-in";
import { Loader2 } from "lucide-react";

type Guest = {
  id: string;
  name: string;
  table_no: string | null;
  category: "VVIP" | "VIP" | "Regular";
  attendance_status: "Hadir" | "Belum";
  phone?: string;
  pax?: number | null;
};

export default function AttendancePage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    // Initial load
    loadGuests();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("attendance-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "guests",
        },
        () => {
          loadGuests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadGuests = async () => {
    try {
      const { data, error } = await supabase
        .from("guests")
        .select("id, name, table_no, category, attendance_status, phone, pax")
        .order("name");

      if (error) throw error;
      setGuests(data || []);
    } catch (error) {
      console.error("Error loading guests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (guestName: string, guestId: string) => {
    setProcessingId(guestId);
    // optimistic update
    const prev = guests;
    setGuests((gs) => gs.map((g) => (g.id === guestId ? { ...g, attendance_status: "Hadir" } : g)));
    const res = await checkInGuest(guestName, "attendance_page");
    if (!res || !(res as any).success) {
      // rollback on failure
      setGuests(prev);
    }
    setProcessingId(null);
  };

  const handleUndo = async (guestId: string) => {
    setProcessingId(guestId);
    // optimistic update
    const prev = guests;
    setGuests((gs) => gs.map((g) => (g.id === guestId ? { ...g, attendance_status: "Belum" } : g)));
    const res = await undoCheckIn(guestId);
    if (!res || !(res as any).success) {
      // rollback on failure
      setGuests(prev);
    }
    setProcessingId(null);
  };

  const guestCount = guests.length;
  const totalPax = guests.reduce((sum, g) => sum + (g.pax ?? 1), 0);
  const hadirPax = guests.reduce((sum, g) => sum + (g.attendance_status === "Hadir" ? (g.pax ?? 1) : 0), 0);
  const belumPax = totalPax - hadirPax;
  const percent = totalPax ? Math.round((hadirPax / totalPax) * 100) : 0;

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return guests;
    return guests.filter((g) => g.name.toLowerCase().includes(s));
  }, [q, guests]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Total Undangan" value={guestCount} />
        <StatCard title="Total Pax" value={totalPax} />
        <StatCard title="Hadir" value={hadirPax} />
        <StatCard title="Belum Hadir" value={belumPax} />
        <StatCard title="% Hadir" value={`${percent}%`} />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Input placeholder="Cari nama tamu..." value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm">
          <CardContent className="p-0 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2 text-left">No</th>
                  <th className="px-3 py-2 text-left">Nama Tamu</th>
                  <th className="px-3 py-2 text-left">Meja</th>
                  <th className="px-3 py-2 text-left">Kategori</th>
                  <th className="px-3 py-2 text-left">Jml (Pax)</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-slate-500">
                      No guests found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((guest, i) => (
                    <tr key={guest.id} className="border-t">
                      <td className="px-3 py-2">{i + 1}</td>
                      <td className="px-3 py-2">
                        <div className="font-medium">{guest.name}</div>
                        {guest.phone && (
                          <div className="text-xs text-slate-500">{guest.phone}</div>
                        )}
                      </td>
                      <td className="px-3 py-2">{guest.table_no || "-"}</td>
                      <td className="px-3 py-2">
                        <Badge variant="secondary">{guest.category}</Badge>
                      </td>
                      <td className="px-3 py-2">{guest.pax ?? 1}</td>
                      <td className="px-3 py-2">
                        <Badge
                          className={
                            guest.attendance_status === "Hadir"
                              ? "bg-green-600"
                              : "bg-slate-400"
                          }
                        >
                          {guest.attendance_status}
                        </Badge>
                      </td>
                      <td className="px-3 py-2">
                        {guest.attendance_status === "Hadir" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUndo(guest.id)}
                            disabled={processingId === guest.id}
                          >
                            {processingId === guest.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              "Batal"
                            )}
                          </Button>
                        ) : (
                          <Button
                            className="bg-slate-900"
                            size="sm"
                            onClick={() => handleCheckIn(guest.name, guest.id)}
                            disabled={processingId === guest.id}
                          >
                            {processingId === guest.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              "Hadir"
                            )}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number | string }) {
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm text-slate-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}
