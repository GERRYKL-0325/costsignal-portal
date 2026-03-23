import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "CostSignal Portal",
  description: "Manage your CostSignal API keys and usage",
};

const clerkAppearance = {
  baseTheme: dark,
  variables: {
    colorPrimary: "#4ade80",
    colorBackground: "#2a2a2a",
    colorInputBackground: "#333333",
    colorInputText: "#e8e8e8",
    colorText: "#e8e8e8",
    colorTextSecondary: "#aaaaaa",
    colorDanger: "#f87171",
    borderRadius: "8px",
    fontFamily: "Inter, sans-serif",
  },
  elements: {
    card: {
      background: "#2a2a2a",
      border: "1px solid #444",
      boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
    },
    rootBox: {
      boxShadow: "none",
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
      <html lang="en" className={inter.variable}>
        <body className="bg-bg text-gray-100 font-sans antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
