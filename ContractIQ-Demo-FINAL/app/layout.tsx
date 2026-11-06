import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ContractIQ AI | Contract Intelligence",
  description: "AI-powered contract intelligence workspace",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
