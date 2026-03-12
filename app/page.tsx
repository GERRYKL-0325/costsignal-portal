import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      {/* Logo / Brand */}
      <div className="mb-12 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-accent" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-white">
            CostSignal
          </span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">
          Developer Portal
        </h1>
        <p className="text-gray-400 text-lg max-w-md">
          Manage your API keys, monitor usage, and integrate economic data
          series into your applications.
        </p>
      </div>

      {/* CTA */}
      <div className="flex gap-4">
        <Link
          href="/sign-in"
          className="px-6 py-3 rounded-lg bg-accent text-black font-semibold hover:bg-accent-dim transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/sign-up"
          className="px-6 py-3 rounded-lg bg-bg2 text-white font-semibold border border-border hover:border-gray-600 transition-colors"
        >
          Create Account
        </Link>
      </div>

      {/* Features */}
      <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl w-full">
        {[
          {
            icon: "🔑",
            title: "API Keys",
            desc: "Generate and rotate keys with one click.",
          },
          {
            icon: "📊",
            title: "Usage Analytics",
            desc: "Track calls, endpoints, and response times.",
          },
          {
            icon: "📈",
            title: "Economic Data",
            desc: "BLS, FRED, and EIA series at your fingertips.",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="bg-bg2 border border-border rounded-xl p-5"
          >
            <div className="text-2xl mb-3">{f.icon}</div>
            <div className="font-semibold text-white mb-1">{f.title}</div>
            <div className="text-sm text-gray-400">{f.desc}</div>
          </div>
        ))}
      </div>

      <footer className="mt-16 text-gray-600 text-sm">
        © {new Date().getFullYear()} CostSignal · Economic data infrastructure
      </footer>
    </main>
  );
}
