import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FLIXO — One More Episode",
  description: "Vertical stories. Big emotions."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="th"><body>{children}</body></html>;
}
