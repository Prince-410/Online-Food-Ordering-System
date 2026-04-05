import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import React from "react";
import { Toaster } from "react-hot-toast";
import QueryProvider from "@/providers/QueryProvider";
import ConditionalLayout from "@/components/layout/ConditionalLayout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CraveBite | Next-Gen Food Delivery",
  description: "Experience the fastest, most intuitive AI-powered food ordering platform. Smart recommendations, real-time tracking, and premium experience.",
  keywords: "food delivery, order food online, AI food recommendations, CraveBite",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${poppins.variable} h-full antialiased`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ff385c" />
      </head>
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <QueryProvider>
          <Toaster 
            position="top-center" 
            toastOptions={{
              style: {
                borderRadius: '12px',
                background: '#1e293b',
                color: '#f8fafc',
                fontSize: '14px',
                fontWeight: '500',
              },
            }}
          />
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </QueryProvider>
      </body>
    </html>
  );
}
