import type { Metadata, Viewport } from "next";
// Self-hosted via @fontsource (no runtime dependency on Google's font
// CDN — more reliable in restricted network environments and avoids
// a third-party request on every visit).
import "@fontsource/cormorant-garamond/300.css";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/parisienne/400.css";
import "@fontsource/jost/300.css";
import "@fontsource/jost/400.css";
import "@fontsource/jost/500.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Helson & Luna — December 17, 2026",
  description:
    "Two souls, one promise. Join Helson & Luna as they begin a journey of love, grace, and endless beginnings.",
};

export const viewport: Viewport = {
  themeColor: "#201d30",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-twilight-975 text-pearl-white antialiased">
        {children}
      </body>
    </html>
  );
}
