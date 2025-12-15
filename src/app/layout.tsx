import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { DataProvider } from "@/components/data-provider";
import { Sidebar } from "@/components/sidebar";
import { AIPanel } from "@/components/ai-panel";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "FloorOps Pro - Enterprise Project Manager",
  description: "Professional flooring operations management platform for contractors and enterprise teams",
  keywords: ["flooring", "project management", "construction", "contractor", "operations"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider>
          <DataProvider>
            <div className="flex min-h-screen bg-background">
              <Sidebar />
              <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {children}
              </main>
            </div>
            <AIPanel />
            <Toaster richColors position="bottom-right" />
          </DataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
