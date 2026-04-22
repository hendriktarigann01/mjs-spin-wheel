import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spin Wheel by MJ Solution Indonesia",
  description:
    "Interactive spin wheel for lucky draws, promotions, and engaging campaigns.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-courier antialiased">{children}</body>
    </html>
  );
}
