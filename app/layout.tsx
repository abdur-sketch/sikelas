import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIKELAS Nurul Iman",
  description: "Sistem Informasi Kelas dan Pembelajaran SMK Nurul Iman — Belajar, Berkarya, dan Bertumbuh Bersama.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
