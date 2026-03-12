import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-accent" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">
            CostSignal
          </span>
        </div>
        <p className="text-gray-400 text-sm">Sign in to your developer portal</p>
      </div>
      <SignIn
        appearance={{
          variables: {
            colorBackground: "#111111",
            colorText: "#f9fafb",
            colorPrimary: "#4ade80",
            colorInputBackground: "#1a1a1a",
            colorInputText: "#f9fafb",
            borderRadius: "0.5rem",
          },
          elements: {
            card: "bg-bg2 border border-border shadow-xl",
            headerTitle: "text-white",
            headerSubtitle: "text-gray-400",
            socialButtonsBlockButton: "border-border text-gray-300 hover:bg-bg",
            formFieldInput: "bg-[#1a1a1a] border-border text-white",
            formButtonPrimary: "bg-accent hover:bg-accent-dim text-black font-semibold",
            footerActionLink: "text-accent hover:text-accent-dim",
          },
        }}
      />
    </main>
  );
}
