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
    colorBackground: "#242424",
    colorInputBackground: "#222222",
    colorInputText: "#e8e8e8",
    colorText: "#e8e8e8",
    colorTextSecondary: "#888888",
    colorDanger: "#f87171",
    borderRadius: "8px",
    fontFamily: "Inter, sans-serif",
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
