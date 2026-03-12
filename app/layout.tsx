import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "CostSignal Portal",
  description: "Manage your CostSignal API keys and usage",
};

const clerkAppearance = {
  variables: {
    colorPrimary: "#4ade80",
    colorBackground: "#111111",
    colorInputBackground: "#0a0a0a",
    colorInputText: "#e8e8e8",
    colorText: "#e8e8e8",
    colorTextSecondary: "#777777",
    colorDanger: "#f87171",
    colorSuccess: "#4ade80",
    borderRadius: "8px",
    fontFamily: "Inter, sans-serif",
    fontSize: "14px",
  },
  elements: {
    rootBox: { width: "100%" },
    card: {
      background: "#111",
      border: "1px solid #1a1a1a",
      boxShadow: "none",
      borderRadius: "12px",
    },
    headerTitle: { color: "#e8e8e8", fontWeight: "700", fontSize: "1.15rem" },
    headerSubtitle: { color: "#666" },
    socialButtonsBlockButton: {
      background: "#0a0a0a",
      border: "1px solid #222",
      color: "#ccc",
    },
    socialButtonsBlockButton__google: {
      background: "#0a0a0a",
      border: "1px solid #222",
      color: "#ccc",
    },
    dividerLine: { background: "#1a1a1a" },
    dividerText: { color: "#444" },
    formFieldLabel: { color: "#888", fontSize: "0.75rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" },
    formFieldInput: {
      background: "#0a0a0a",
      border: "1px solid #222",
      color: "#e8e8e8",
      borderRadius: "7px",
      fontSize: "0.9rem",
    },
    formFieldInput__focus: { borderColor: "#4ade80" },
    formButtonPrimary: {
      background: "#4ade80",
      color: "#000",
      fontWeight: "700",
      fontSize: "0.9rem",
      borderRadius: "8px",
      border: "none",
    },
    footerActionLink: { color: "#4ade80" },
    footerAction: { color: "#555" },
    identityPreviewText: { color: "#aaa" },
    identityPreviewEditButton: { color: "#4ade80" },
    badge: { display: "none" },  // hide "Development mode" badge
    logoBox: { display: "none" },  // hide Clerk logo
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
