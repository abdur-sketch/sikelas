import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://sikelas-nurul-iman.baikganteng88.chatgpt.site"),
  title: "SIKELAS Nurul Iman",
  description: "Sistem Informasi Kelas dan Pembelajaran SMK Nurul Iman — Belajar, Berkarya, dan Bertumbuh Bersama.",
  openGraph: {
    title: "SIKELAS Nurul Iman",
    description: "Belajar, Berkarya, dan Bertumbuh Bersama.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "SIKELAS Nurul Iman" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SIKELAS Nurul Iman",
    description: "Belajar, Berkarya, dan Bertumbuh Bersama.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
