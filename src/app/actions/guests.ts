"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export type GuestInput = {
  name: string;
  phone?: string;
  address?: string;
  category: "VVIP" | "VIP" | "Regular";
  source?: string;
  table_no?: string;
  pax?: number;
  rsvp_status?: "Ya" | "Tidak" | "Belum";
};

export async function createGuest(input: GuestInput) {
  try {
    // Whitelist allowed fields to avoid accidental extra props (e.g., temp ids)
    const { name, phone, address, category, source, table_no, pax, rsvp_status } = input;
    const payload = {
      name,
      phone,
      address,
      category,
      source,
      table_no,
      pax,
      rsvp_status: rsvp_status ?? "Belum",
      attendance_status: "Belum" as const,
      souvenir_status: "Pending" as const,
    };

    const { data, error } = await supabase
      .from("guests")
      .insert(payload)
      .select("*")
      .single();

    if (error) throw error;

    revalidatePath("/guests");
    return { success: true, data };
  } catch (error: any) {
    console.error("createGuest error:", error);
    return { success: false, error: error.message || "Failed to create guest" };
  }
}

export async function updateGuest(id: string, input: Partial<GuestInput>) {
  try {
    // Whitelist update-able fields
    const { name, phone, address, category, source, table_no, pax, rsvp_status } = input;
    const updatePayload: Record<string, unknown> = {};
    if (name !== undefined) updatePayload.name = name;
    if (phone !== undefined) updatePayload.phone = phone;
    if (address !== undefined) updatePayload.address = address;
    if (category !== undefined) updatePayload.category = category;
    if (source !== undefined) updatePayload.source = source;
    if (table_no !== undefined) updatePayload.table_no = table_no;
    if (pax !== undefined) updatePayload.pax = pax;
    if (rsvp_status !== undefined) updatePayload.rsvp_status = rsvp_status;

    const { data, error } = await supabase
      .from("guests")
      .update(updatePayload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    revalidatePath("/guests");
    return { success: true, data };
  } catch (error: any) {
    console.error("updateGuest error:", error);
    return { success: false, error: error.message || "Failed to update guest" };
  }
}

export async function deleteGuest(id: string) {
  try {
    const { error } = await supabase.from("guests").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/guests");
    return { success: true };
  } catch (error: any) {
    console.error("deleteGuest error:", error);
    return { success: false, error: error.message || "Failed to delete guest" };
  }
}

export type ImportRow = {
  name: string;
  phone?: string;
  address?: string;
  category: "VVIP" | "VIP" | "Regular";
  table_no?: string;
  pax?: number;
  rsvp_status?: "Ya" | "Tidak" | "Belum";
};

export async function bulkImportGuests(rows: ImportRow[]) {
  try {
    if (!rows || rows.length === 0) {
      return { success: false, error: "No rows to import" };
    }

    const payload = rows.map((r) => ({
      ...r,
      pax: r.pax,
      rsvp_status: r.rsvp_status ?? "Belum",
      attendance_status: "Belum",
      souvenir_status: "Pending",
    }));

    const { error } = await supabase.from("guests").insert(payload);
    if (error) throw error;

    revalidatePath("/guests");
    return { success: true, count: rows.length };
  } catch (error: any) {
    console.error("bulkImportGuests error:", error);
    return { success: false, error: error.message || "Failed to import guests" };
  }
}
