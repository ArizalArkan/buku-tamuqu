import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

function Donut({
  value,
  total,
  label,
  colorHex = "#134e4a", // teal-900
}: {
  value: number;
  total: number;
  label: string;
  colorHex?: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-slate-600">{label}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <div
          className="relative h-24 w-24 rounded-full"
          style={{
            background: `conic-gradient(${colorHex} ${pct}%, #e5e7eb 0)` /* slate-200 remainder */,
          }}
        >
          <div className="absolute inset-2 rounded-full bg-white"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-semibold">{pct}%</span>
          </div>
        </div>
        <div>
          <div className="text-2xl font-semibold">{value}</div>
          <div className="text-xs text-slate-500">dari {total} tamu</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function Home() {
  // Load live data from Supabase
  const { data, error } = await supabase
    .from("guests")
    .select("category, attendance_status, souvenir_status");

  const totals = (data || []).reduce(
    (acc: { total: number; vvip: number; vip: number; regular: number; hadir: number; souvenir: number }, g: any) => {
      acc.total += 1;
      if (g.category === "VVIP") acc.vvip += 1;
      if (g.category === "VIP") acc.vip += 1;
      if (g.category === "Regular") acc.regular += 1;
      if (g.attendance_status === "Hadir") acc.hadir += 1;
      if (g.souvenir_status === "Terima") acc.souvenir += 1;
      return acc;
    },
    { total: 0, vvip: 0, vip: 0, regular: 0, hadir: 0, souvenir: 0 }
  );

  const categoryCards = [
    { label: "VVIP", value: totals.vvip },
    { label: "VIP", value: totals.vip },
    { label: "Regular", value: totals.regular },
  ].filter((c) => c.value > 0);

  const donutItems = [
    totals.hadir > 0 && { label: "Total Kehadiran", value: totals.hadir, total: totals.total },
    totals.souvenir > 0 && { label: "Souvenir Diterima", value: totals.souvenir, total: totals.total },
  ].filter(Boolean) as Array<{ label: string; value: number; total: number }>;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section>
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Akad event — 26 April 2026</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">Selamat datang di dashboard Buku Tamu.</p>
            {error && (
              <p className="text-sm text-red-600 mt-2">Gagal memuat data tamu.</p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Kategori Tamu */}
      {categoryCards.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categoryCards.map((m) => (
            <Card key={m.label} className="bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-600">{m.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{m.value}</div>
                <div className="text-xs text-slate-500 mt-1">Total terdaftar</div>
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      {/* Kehadiran Sesi Acara removed (no live data) */}

      {/* Statistik Donut Charts */}
      {donutItems.length > 0 && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {donutItems.map((d) => (
            <Donut key={d.label} value={d.value} total={d.total} label={d.label} />
          ))}
        </section>
      )}
    </div>
  );
}
