"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QRScanner } from "@/components/qr-scanner";
import { checkInGuest, getRecentCheckIns, deleteCheckIn } from "@/app/actions/check-in";
import { CheckCircle, XCircle, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type CheckInRecord = {
  id: string;
  checked_in_at: string;
  check_in_method: string;
  guest: {
    id: string;
    name: string;
    category: string;
    table_no: string | null;
  };
};

export default function CheckInPage() {
  const [barcode, setBarcode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [recentCheckIns, setRecentCheckIns] = useState<CheckInRecord[]>([]);
  const [suggestions, setSuggestions] = useState<Array<{ id: string; name: string }>>([]);

  // Load recent check-ins on mount
  useEffect(() => {
    loadRecentCheckIns();
  }, []);

  // Realtime subscription for check-in updates
  useEffect(() => {
    const ch = supabase
      .channel("check-ins-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "check_ins" },
        () => loadRecentCheckIns()
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "check_ins" },
        () => loadRecentCheckIns()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  const loadRecentCheckIns = async () => {
    const result = await getRecentCheckIns(10);
    if (result.success && result.data) {
      setRecentCheckIns(result.data as any);
    }
  };

  const handleQRScan = async (data: string) => {
    try {
      // Parse QR code URL to extract guest name from ?to= parameter
      const url = new URL(data);
      const guestName = url.searchParams.get("to");

      if (!guestName) {
        setMessage({ type: "error", text: "Invalid QR code: missing guest name" });
        return;
      }

      setIsProcessing(true);
      const result = await checkInGuest(guestName, "qr_scan");

      if (result.success) {
        setMessage({ type: "success", text: result.message || "Check-in successful!" });
        await loadRecentCheckIns();
      } else {
        setMessage({ type: "error", text: result.error || "Check-in failed" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Invalid QR code format" });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleManualBarcode = async () => {
    if (!barcode.trim()) return;

    setIsProcessing(true);
    try {
      // Try to parse as URL first
      const url = new URL(barcode);
      const guestName = url.searchParams.get("to");
      
      if (guestName) {
        const result = await checkInGuest(guestName, "manual");
        if (result.success) {
          setMessage({ type: "success", text: result.message || "Check-in successful!" });
          await loadRecentCheckIns();
          setBarcode("");
        } else {
          setMessage({ type: "error", text: result.error || "Check-in failed" });
        }
      } else {
        setMessage({ type: "error", text: "Invalid barcode format" });
      }
    } catch {
      // If not a URL, treat as direct guest name
      const result = await checkInGuest(barcode.trim(), "manual");
      if (result.success) {
        setMessage({ type: "success", text: result.message || "Check-in successful!" });
        await loadRecentCheckIns();
        setBarcode("");
      } else {
        setMessage({ type: "error", text: result.error || "Check-in failed" });
      }
    } finally {
      setIsProcessing(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleSearchCheckIn = async () => {
    if (!searchQuery.trim()) return;

    setIsProcessing(true);
    const result = await checkInGuest(searchQuery.trim(), "manual");
    
    if (result.success) {
      setMessage({ type: "success", text: result.message || "Check-in successful!" });
      await loadRecentCheckIns();
      setSearchQuery("");
    } else {
      setMessage({ type: "error", text: result.error || "Check-in failed" });
    }
    
    setIsProcessing(false);
    setTimeout(() => setMessage(null), 5000);
  };

  // Simple suggestions from Supabase by name (case-insensitive)
  const loadSuggestions = async (q: string) => {
    if (!q) {
      setSuggestions([]);
      return;
    }
    const { data, error } = await supabase
      .from("guests")
      .select("id, name")
      .ilike("name", `%${q}%`)
      .limit(5);
    if (!error) setSuggestions(data || []);
  };

  return (
    <div className="space-y-4">
      {/* Status Message */}
      {message && (
        <Card className={`border-2 ${message.type === "success" ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}`}>
          <CardContent className="p-4 flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <span className={message.type === "success" ? "text-green-700" : "text-red-700"}>
              {message.text}
            </span>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm">Check-in Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {/* QR Scanner */}
          <div>
            <p className="text-xs text-slate-600 mb-2 font-medium">Scan QR Code</p>
            <QRScanner 
              onScan={handleQRScan}
              onError={(error) => setMessage({ type: "error", text: error })}
            />
          </div>

          {/* Search Guest */}
          <div className="space-y-2">
            <p className="text-xs text-slate-600 mb-2 font-medium">Cari Tamu Terdaftar</p>
            <div>
              <Input 
                placeholder="Ketik nama tamu..." 
                value={searchQuery}
                onChange={(e) => {
                  const v = e.target.value;
                  setSearchQuery(v);
                  loadSuggestions(v);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSearchCheckIn()}
              />
              {suggestions.length > 0 && (
                <div className="mt-1 border rounded-md bg-white shadow-sm overflow-hidden">
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
                      onClick={() => {
                        setSearchQuery(s.name);
                        setSuggestions([]);
                      }}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button 
              className="w-full bg-slate-900"
              onClick={handleSearchCheckIn}
              disabled={isProcessing || !searchQuery.trim()}
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check-in"}
            </Button>
          </div>

          {/* Manual Barcode */}
          <div className="space-y-2">
            <p className="text-xs text-slate-600 mb-2 font-medium">Manual Barcode/URL</p>
            <Input 
              placeholder="Paste URL or name" 
              value={barcode} 
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleManualBarcode()}
            />
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleManualBarcode}
              disabled={isProcessing || !barcode.trim()}
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Proses"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm">Recent Check-in</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-slate-600">
              <tr>
                <th className="px-3 py-2 text-left">No</th>
                <th className="px-3 py-2 text-left">Nama Tamu</th>
                <th className="px-3 py-2 text-left">Kategori</th>
                <th className="px-3 py-2 text-left">Meja</th>
                <th className="px-3 py-2 text-left">Metode</th>
                <th className="px-3 py-2 text-left">Waktu</th>
                <th className="px-3 py-2 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {recentCheckIns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                    No recent check-ins
                  </td>
                </tr>
              ) : (
                recentCheckIns.map((record, i) => (
                  <tr key={record.id} className="border-t">
                    <td className="px-3 py-2">{i + 1}</td>
                    <td className="px-3 py-2 font-medium">{record.guest?.name || "N/A"}</td>
                    <td className="px-3 py-2">
                      <Badge variant="outline">{record.guest?.category || "N/A"}</Badge>
                    </td>
                    <td className="px-3 py-2">{record.guest?.table_no || "-"}</td>
                    <td className="px-3 py-2">
                      <Badge variant={record.check_in_method === "qr_scan" ? "default" : "secondary"}>
                        {record.check_in_method === "qr_scan" ? "QR Scan" : "Manual"}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-600">
                      {new Date(record.checked_in_at).toLocaleString("id-ID")}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        className="text-red-600 hover:underline inline-flex items-center gap-1"
                        onClick={async () => {
                          await deleteCheckIn(record.id);
                          await loadRecentCheckIns();
                        }}
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" /> Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
