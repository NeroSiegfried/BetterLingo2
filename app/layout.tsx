import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BetterLingo - Learn Languages Naturally",
  description: "AI-powered language learning through contextual conversations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
