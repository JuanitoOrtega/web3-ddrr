import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Registro DDRR — Verificación de títulos",
  description:
    "Capa de validación paralela para títulos de propiedad en Bolivia. Verifica al dueño real antes de pagar.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: las extensiones del navegador (LanguageTool,
    // Grammarly, gestores de contraseñas) inyectan atributos en <html> antes de
    // que React hidrate. No es un fallo nuestro y no afecta al contenido.
    <html lang="es-BO" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
