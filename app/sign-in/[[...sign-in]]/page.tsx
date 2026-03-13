import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
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
          baseTheme: dark,
          variables: {
            colorPrimary: "#4ade80",
            colorBackground: "#111111",
            colorInputBackground: "#1a1a1a",
            colorInputText: "#e8e8e8",
            colorText: "#e8e8e8",
            colorTextSecondary: "#888888",
            colorDanger: "#f87171",
            borderRadius: "8px",
            fontFamily: "Inter, sans-serif",
          },
        }}
      />
      <p style={{ marginTop: "1rem", fontSize: "0.75rem", color: "#444", textAlign: "center" }}>
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" style={{ color: "#4ade80", textDecoration: "none" }}>Get started free →</Link>
      </p>
    </main>
  );
}
