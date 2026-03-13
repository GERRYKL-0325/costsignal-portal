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
        <p style={{ color: "#333", fontSize: "0.7rem", marginTop: "0.2rem" }}>
          key: {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.slice(0,12) ?? "MISSING"}...
        </p>
      </div>
      <SignIn
        appearance={{
          variables: {
            colorBackground: "#111111",
            colorInputBackground: "#1a1a1a",
            colorInputText: "#e8e8e8",
            colorText: "#e8e8e8",
            colorTextSecondary: "#888888",
            colorPrimary: "#4ade80",
            colorDanger: "#f87171",
            colorNeutral: "#333333",
            borderRadius: "8px",
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
          },
          elements: {
            rootBox: { width: "100%", maxWidth: "400px" },
            card: {
              boxShadow: "0 0 0 1px #222",
              background: "#111111",
              border: "1px solid #222",
            },
            headerTitle: { color: "#e8e8e8" },
            headerSubtitle: { color: "#888" },
            socialButtonsBlockButton: {
              background: "#1a1a1a",
              border: "1px solid #2a2a2a",
              color: "#e8e8e8",
            },
            socialButtonsBlockButton__google: { color: "#e8e8e8" },
            dividerLine: { background: "#222" },
            dividerText: { color: "#555" },
            formFieldLabel: { color: "#aaa" },
            formFieldInput: {
              background: "#1a1a1a",
              border: "1px solid #2a2a2a",
              color: "#e8e8e8",
            },
            formFieldInput__focus: { borderColor: "#4ade80" },
            formButtonPrimary: {
              background: "#4ade80",
              color: "#000",
              fontWeight: "600",
            },
            footerActionText: { color: "#666" },
            footerActionLink: { color: "#4ade80" },
            identityPreviewText: { color: "#e8e8e8" },
            identityPreviewEditButtonIcon: { color: "#888" },
            badge: { display: "none" },
            footer: { background: "#111111", borderTop: "1px solid #1a1a1a" },
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
