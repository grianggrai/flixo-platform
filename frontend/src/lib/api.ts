import { createClient } from "@/lib/supabase/client";

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) throw new Error("กรุณาเข้าสู่ระบบอีกครั้ง");

  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) throw new Error("ยังไม่ได้กำหนด NEXT_PUBLIC_API_BASE_URL");

  const response = await fetch(`${base.replace(/\/$/, "")}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${data.session.access_token}`,
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = typeof payload.detail === "string" ? payload.detail : "เกิดข้อผิดพลาดในการเรียก API";
    throw new Error(detail);
  }
  return payload as T;
}
