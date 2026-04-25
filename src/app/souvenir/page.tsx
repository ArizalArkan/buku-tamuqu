"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Row = {
  id: number;
  name: string;
  status: "Pending" | "Terima";
  at?: string;
};

const initial: Row[] = [
  { id: 1, name: "Budi Santoso", status: "Pending" },
  { id: 2, name: "Siti Aminah", status: "Terima", at: "10:30" },
];

export default function SouvenirPage() {
  const [rows, setRows] = useState<Row[]>(initial);
  const [q, setQ] = useState("");

  const metrics = useMemo(() => {
    const total = rows.length;
    const diterima = rows.filter((r) => r.status === "Terima").length;
    const sisa = total - diterima;
    return { total, diterima, sisa };
  }, [rows]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => r.name.toLowerCase().includes(s));
  }, [q, rows]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Metric title="Jumlah Souvenir" value={metrics.total} />
        <Metric title="Diterima" value={metrics.diterima} />
        <Metric title="Sisa Souvenir" value={metrics.sisa} />
      </div>

      <Card className="bg-white shadow-sm">
        <CardContent className="p-4 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-2">
            <Button variant="outline">+ Tambah Jumlah</Button>
            <Button variant="outline">Export</Button>
            <Button className="bg-slate-900">Scan QR</Button>
          </div>
          <Input placeholder="Cari..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm">
        <CardContent className="p-0 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-slate-600">
              <tr>
                <th className="px-3 py-2 text-left">List</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Waktu Ambil</th>
                <th className="px-3 py-2 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2">{r.name}</td>
                  <td className="px-3 py-2">
                    <Badge className={r.status === "Terima" ? "bg-green-600" : "bg-slate-400"}>
                      {r.status === "Terima" ? "Terima Souvenir" : "Pending"}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">{r.at ? `2026-06-12 ${r.at}` : "-"}</td>
                  <td className="px-3 py-2">
                    {r.status === "Pending" ? (
                      <Button className="bg-slate-900" onClick={() => setRows((prev) => prev.map((x) => x.id === r.id ? { ...x, status: "Terima", at: "10:45" } : x))}>
                        Berikan Souvenir
                      </Button>
                    ) : (
                      <Button variant="outline">Batal</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: number }) {
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
