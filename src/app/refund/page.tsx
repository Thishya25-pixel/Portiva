// src/app/refund/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy",
  description: "Portiva cancellation and refund terms.",
};

export default function RefundPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#080b12] text-slate-300">
      {/* Header Navigation */}
      <header className="border-b border-white/10 bg-[#0d111a]/80 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="text-lg font-bold text-white">
            Portiva<span className="text-indigo-400">.</span>
          </Link>
          <Link href="/login" className="text-xs text-slate-400 hover:text-white">
            Sign in
          </Link>
        </div>
      </header>

      {/* Main Legal Content */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Cancellation & Refund Policy
        </h1>
        <p className="mt-2 text-xs text-slate-500">Last updated: September 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-400">
          <p>
            Due to the digital nature of software subscriptions on Portiva, all sales are final once digital access or Pro features have been granted.
          </p>

          <div className="rounded-xl border border-white/10 bg-[#0d111a] p-5">
            <h2 className="font-semibold text-white">Exceptions & Eligibility</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Refunds will strictly only be issued under the following conditions:
            </p>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-xs text-slate-300">
              <li>A technical error on our end prevents you from accessing your paid Pro account or custom domains.</li>
              <li>An accidental duplicate transaction was processed for the same billing cycle.</li>
            </ul>
          </div>

          <p>
            To report a billing error, duplicate charge, or system malfunction, please contact us at{" "}
            <a href="mailto:support@portiva.online" className="font-medium text-indigo-400 underline hover:text-indigo-300">
              support@portiva.online
            </a>{" "}
            within <strong>7 days</strong> of the transaction date. Please include your registered email address and payment reference / UTR number.
          </p>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}