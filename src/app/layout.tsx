import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "./ConvexClientProvider";
import "./globals.css";

// Travelpayouts "Drive" tracking script. Loaded only when its src is set
// (NEXT_PUBLIC_TP_DRIVE_SRC), so the account id is not hardcoded in source and
// dev/preview builds stay clean. `afterInteractive` keeps it off the critical
// render path (the raw vendor snippet uses a blocking-ish async append).
const TP_DRIVE_SRC = process.env.NEXT_PUBLIC_TP_DRIVE_SRC;

export const metadata: Metadata = {
  title: "Paradise Plan",
  description: "Don't pick where. Pick the feeling.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ClerkProvider>
        {TP_DRIVE_SRC && (
          <Script
            id="travelpayouts-drive"
            src={TP_DRIVE_SRC}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
