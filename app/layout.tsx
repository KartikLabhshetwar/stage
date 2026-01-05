import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Caveat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Stage",
    template: "%s | Stage",
  },
  description: "Create stunning showcase images for your projects with customizable templates and layouts. A fully in-browser canvas editor for adding images, text, and backgrounds—no external services required.",
  keywords: ["image editor", "canvas editor", "design tool", "image showcase", "template builder", "in-browser editor", "client-side export"],
  authors: [{ name: "Stage" }],
  creator: "Stage",
  publisher: "Stage",
  metadataBase: new URL(process.env.BETTER_AUTH_URL || "https://stage-psi-one.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Stage",
    title: "Stage - Image Showcase Builder",
    description: "Create stunning showcase images for your projects with customizable templates and layouts",
    images: [
      {
        url: "https://stage-psi-one.vercel.app/og.jpeg",
        width: 1200,
        height: 630,
        alt: "Stage - Image Showcase Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stage - Image Showcase Builder",
    description: "Create stunning showcase images for your projects with customizable templates and layouts",
    images: ["https://stage-psi-one.vercel.app/og.jpeg"],
    creator: "@stage",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
      <script defer src="https://cloud.umami.is/script.js" data-website-id="11f36f2b-1ef5-4014-bfdb-089aa4770c53"></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
