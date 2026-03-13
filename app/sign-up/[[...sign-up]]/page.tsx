import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
        <Link href="/" style={{ fontWeight: 700, fontSize: "1.1rem", letterSpacing: "-0.02em", textDecoration: "none", color: "#e8e8e8" }}>
          Cost<span style={{ color: "#4ade80" }}>Signal</span>
        </Link>
        <p style={{ color: "#555", fontSize: "0.85rem", marginTop: "0.35rem" }}>Create your free account</p>
      </div>
      <SignUp
        appearance={{
          elements: {
            rootBox: { width: "100%", maxWidth: "400px" },
            card: { boxShadow: "none" },
            badge: { display: "none" },
          },
        }}
      />
      <p style={{ marginTop: "1rem", fontSize: "0.75rem", color: "#333", textAlign: "center" }}>
        After signing up, you'll be taken to the CostSignal Builder.
      </p>
      <p style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "#444" }}>
        Already have an account?{" "}
        <Link href="/sign-in" style={{ color: "#4ade80", textDecoration: "none" }}>Sign in →</Link>
      </p>
    </main>
  );
}
