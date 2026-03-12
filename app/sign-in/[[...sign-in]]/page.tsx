import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
        <Link href="/" style={{ fontWeight: 700, fontSize: "1.1rem", letterSpacing: "-0.02em", textDecoration: "none", color: "#e8e8e8" }}>
          Cost<span style={{ color: "#4ade80" }}>Signal</span>
        </Link>
        <p style={{ color: "#555", fontSize: "0.85rem", marginTop: "0.35rem" }}>Sign in to your account</p>
      </div>
      <SignIn
        appearance={{
          elements: {
            rootBox: { width: "100%", maxWidth: "400px" },
            card: { boxShadow: "none" },
            badge: { display: "none" },
            footer: { "& a[href*='clerk']": { display: "none" } },
          },
        }}
      />
      <p style={{ marginTop: "1.25rem", fontSize: "0.8rem", color: "#444" }}>
        Don't have an account?{" "}
        <Link href="/sign-up" style={{ color: "#4ade80", textDecoration: "none" }}>Get started free →</Link>
      </p>
    </main>
  );
}
