import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OrgSuite Pipedream Connect",
  description: "Development Connect surface for Pipedream project proj_qzsEmM9",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
