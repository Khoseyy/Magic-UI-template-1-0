import { ThemeProvider } from "@/components/theme-provider";
import { siteConfig } from "@/lib/site";
import type { Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";

const DynamicNavbar = dynamic(() => import("@/components/sections/navbar").then(mod => ({ default: mod.Navbar })), {
  ssr: false
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "black",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* <head>
        <Script src="https://unpkg.com/react-scan/dist/auto.global.js" />
      </head> */}

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans bg-background`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="max-w-7xl mx-auto border-x relative">
            <div className="block w-px h-full border-l border-border absolute top-0 left-6 z-10"></div>
            <div className="block w-px h-full border-r border-border absolute top-0 right-6 z-10"></div>
            <DynamicNavbar />
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
