import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chadito IS Admin",
  description: "Back-office administratif pour Chadito",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <body className={`${inter.className} h-full bg-background antialiased`}>
        {children}
      </body>
    </html>
  );
}
