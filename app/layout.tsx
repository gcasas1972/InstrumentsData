import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Registro de instrumentos",
  description: "Registro interno de instrumentos y sus números de serie.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
