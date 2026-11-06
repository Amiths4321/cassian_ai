import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HeronIDP ContractIQ | Contract Intelligence",
  description: "HeronIDP-powered contract intelligence workspace",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
