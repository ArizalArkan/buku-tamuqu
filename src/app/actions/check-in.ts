"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function checkInGuest(
  guestName: string,
  method: "qr_scan" | "manual" | "attendance_page" = "qr_scan"
) {
  try {
    // Find guest by name (case-insensitive)
    const { data: guests, error: findError } = await supabase
      .from("guests")
      .select("*")
      .ilike("name", guestName)
      .limit(1);

    if (findError) {
      console.error("Error finding guest:", findError);
      return { success: false, error: "Database error while finding guest" };
    }

    if (!guests || guests.length === 0) {
      return { success: false, error: `Guest "${guestName}" not found` };
    }

    const guest = guests[0];

    // Check if already checked in
    if (guest.attendance_status === "Hadir") {
      return {
        success: false,
        error: `${guestName} is already checked in`,
        guest,
      };
    }

    // Update guest attendance status
    const { error: updateError } = await supabase
      .from("guests")
      .update({
        attendance_status: "Hadir",
        checked_in_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", guest.id);

    if (updateError) {
      console.error("Error updating guest:", updateError);
      return { success: false, error: "Failed to update attendance status" };
    }

    // Log check-in history
    const { error: logError } = await supabase.from("check_ins").insert({
      guest_id: guest.id,
      check_in_method: method,
      checked_in_at: new Date().toISOString(),
    });

    if (logError) {
      console.error("Error logging check-in:", logError);
      // Don't fail the whole operation if logging fails
    }

    // Revalidate relevant pages
    revalidatePath("/check-in");
    revalidatePath("/attendance");

    return {
      success: true,
      message: `${guestName} checked in successfully!`,
      guest: { ...guest, attendance_status: "Hadir" },
    };
  } catch (error) {
    console.error("Check-in error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function undoCheckIn(guestId: string) {
  try {
    const { error } = await supabase
      .from("guests")
      .update({
        attendance_status: "Belum",
        checked_in_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", guestId);

    if (error) {
      console.error("Error undoing check-in:", error);
      return { success: false, error: "Failed to undo check-in" };
    }

    revalidatePath("/check-in");
    revalidatePath("/attendance");

    return { success: true, message: "Check-in undone successfully" };
  } catch (error) {
    console.error("Undo check-in error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getRecentCheckIns(limit = 10) {
  try {
    const { data, error } = await supabase
      .from("check_ins")
      .select(
        `
        id,
        checked_in_at,
        check_in_method,
        guest:guests (
          id,
          name,
          category,
          table_no
        )
      `
      )
      .order("checked_in_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching recent check-ins:", error);
      return { success: false, error: "Failed to fetch recent check-ins" };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Get recent check-ins error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function deleteCheckIn(recordId: string) {
  try {
    const { error } = await supabase.from("check_ins").delete().eq("id", recordId);
    if (error) {
      console.error("Error deleting check-in:", error);
      return { success: false, error: "Failed to delete check-in record" };
    }

    revalidatePath("/check-in");
    return { success: true };
  } catch (error) {
    console.error("Delete check-in error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
