import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type FlixoRole = "viewer" | "creator" | "editor" | "admin";
export type FlixoProfile = { id: string; display_name: string | null; role: FlixoRole; status: "active" | "suspended" };

export async function getCurrentProfile(): Promise<FlixoProfile | null> {
  try {
    const supabase = await createClient();
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
    const subject = claimsData?.claims?.sub;
    if (claimsError || typeof subject !== "string") return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("id,display_name,role,status")
      .eq("id", subject)
      .single();

    if (error || !data || data.status !== "active") return null;
    return data as FlixoProfile;
  } catch {
    // Public pages remain renderable before environment provisioning; protected layouts redirect to login.
    return null;
  }
}

export async function requireRole(allowed: FlixoRole[]) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!allowed.includes(profile.role)) redirect("/forbidden");
  return profile;
}
