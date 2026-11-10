import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth";

export default async function CreatorLayout({ children }: { children: ReactNode }) {
  await requireRole(["creator"]);
  return children;
}
