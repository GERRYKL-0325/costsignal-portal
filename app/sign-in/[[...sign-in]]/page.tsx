import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
        <Link href="/" style={{ fontWeight: 700, fontSize: "1.1rem", letterSpacing: "-0.02em", textDecoration: "none", color: "#e8e8e8" }}>
          Cost<span style={{ color: "#4ade80" }}>Signal</span>
        </Link>
        <p style={{ color: "#666", fontSize: "0.85rem", marginTop: "0.35rem" }}>Sign in to your account</p>
      </div>
      <SignIn
        appearance={{
          variables: {
            colorBackground: "#1c1c1c",
            colorInputBackground: "#252525",
            colorInputText: "#f0f0f0",
            colorText: "#f0f0f0",
            colorTextSecondary: "#aaaaaa",
            colorPrimary: "#4ade80",
            colorDanger: "#f87171",
            colorNeutral: "#555555",
            borderRadius: "8px",
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
          },
          elements: {
            rootBox: { width: "100%", maxWidth: "400px" },
            card: {
              boxShadow: "0 4px 32px rgba(0,0,0,0.6)",
              background: "#1c1c1c",
              border: "1px solid #3a3a3a",
              borderRadius: "12px",
            },
            headerTitle: { color: "#f0f0f0" },
            headerSubtitle: { color: "#aaa" },
            socialButtonsBlockButton: {
              background: "#252525",
              border: "1px solid #3a3a3a",
              color: "#f0f0f0",
            },
            dividerLine: { background: "#333" },
            dividerText: { color: "#666" },
            formFieldLabel: { color: "#bbb" },
            formFieldInput: {
              background: "#252525",
              border: "1px solid #3a3a3a",
              color: "#f0f0f0",
            },
            formButtonPrimary: {
              background: "#4ade80",
              color: "#000",
              fontWeight: "600",
            },
            footerActionText: { color: "#777" },
            footerActionLink: { color: "#4ade80" },
            badge: { display: "none" },
            footer: { background: "#1c1c1c", borderTop: "1px solid #2a2a2a" },
          },
        }}
      />
      <p style={{ marginTop: "1rem", fontSize: "0.75rem", color: "#444", textAlign: "center" }}>
        Don't have an account?{" "}
        <Link href="/sign-up" style={{ color: "#4ade80", textDecoration: "none" }}>Get started free →</Link>
      </p>
    </main>
  );
}
