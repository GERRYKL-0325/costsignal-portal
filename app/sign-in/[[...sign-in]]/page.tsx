import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <style>{`
        /* Force Clerk card visible on dark background */
        .cl-card {
          background: #161616 !important;
          border: 1px solid #2a2a2a !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 32px rgba(0,0,0,0.6) !important;
        }
        .cl-headerTitle, .cl-headerSubtitle, .cl-formFieldLabel,
        .cl-footerActionText, .cl-dividerText, .cl-identityPreviewText,
        .cl-formFieldSuccessText, .cl-formFieldHintText, .cl-alertText {
          color: #d0d0d0 !important;
        }
        .cl-headerSubtitle, .cl-footerActionText, .cl-dividerText { color: #888 !important; }
        .cl-formFieldInput {
          background: #222 !important;
          border-color: #333 !important;
          color: #e8e8e8 !important;
        }
        .cl-formFieldInput:focus { border-color: #4ade80 !important; }
        .cl-formButtonPrimary {
          background: #4ade80 !important;
          color: #000 !important;
          font-weight: 600 !important;
        }
        .cl-formButtonPrimary:hover { background: #22c55e !important; }
        .cl-socialButtonsBlockButton {
          background: #1e1e1e !important;
          border-color: #333 !important;
          color: #d0d0d0 !important;
        }
        .cl-socialButtonsBlockButtonText { color: #d0d0d0 !important; }
        .cl-dividerLine { background: #2a2a2a !important; }
        .cl-footerActionLink { color: #4ade80 !important; }
        .cl-footer { background: #161616 !important; border-top: 1px solid #222 !important; }
        .cl-internal-b3fm6y { background: #161616 !important; }
        .cl-badge { display: none !important; }
        .cl-logoBox { display: none !important; }
      `}</style>
      <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
        <Link href="/" style={{ fontWeight: 700, fontSize: "1.1rem", letterSpacing: "-0.02em", textDecoration: "none", color: "#e8e8e8" }}>
          Cost<span style={{ color: "#4ade80" }}>Signal</span>
        </Link>
        <p style={{ color: "#666", fontSize: "0.85rem", marginTop: "0.35rem" }}>Sign in to your account</p>
      </div>
      <SignIn
        appearance={{
          variables: {
            colorPrimary: "#4ade80",
            colorText: "#e8e8e8",
            colorBackground: "#161616",
            colorInputBackground: "#222222",
            colorInputText: "#e8e8e8",
            borderRadius: "8px",
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
