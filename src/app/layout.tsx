import type { Metadata, Viewport } from "next";
// Self-hosted via @fontsource (no runtime dependency on Google's font
// CDN — more reliable in restricted network environments and avoids
// a third-party request on every visit).
import "@fontsource/cormorant-garamond/300.css";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/300-italic.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import "@fontsource/pinyon-script/400.css";
import "@fontsource/jost/300.css";
import "@fontsource/jost/400.css";
import "@fontsource/jost/500.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Helson & Luna — 12 · 17 · 2026",
  description:
    "Together with their families, Helson and Luna request the honour of your presence — eight years of love, written among the stars. Thursday, the seventeenth of December 2026, Diversion 21, Iloilo City.",
  icons: { icon: "/assets/logo.webp" },
  openGraph: {
    title: "Helson & Luna — 12 · 17 · 2026",
    description:
      "You are invited. Eight years of love, written among the stars — Thursday, the seventeenth of December 2026, Iloilo City.",
    images: [{ url: "/assets/invitation-crest.jpg", width: 1024, height: 1024, alt: "Helson & Luna wedding crest" }],
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#201d30",
  width: "device-width",
  initialScale: 1,
  // Lets the experience extend under the iOS notch/home bar; the nav
  // and sound toggle pad themselves with env(safe-area-inset-*).
  viewportFit: "cover",
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
