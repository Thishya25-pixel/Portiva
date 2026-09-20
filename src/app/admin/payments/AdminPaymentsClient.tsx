"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface PaymentRequest {
  id: string;
  user_id: string;
  amount: number;
  utr_number: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  profiles?: {
    email: string;
    full_name: string;
  };
}

export default function AdminPaymentsClient({
  currentUserEmail,
  initialRequests,
}: {
  currentUserEmail: string;
  initialRequests: PaymentRequest[];
}) {
  const [requests, setRequests] = useState<PaymentRequest[]>(initialRequests);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const supabase = createClient();

  async function handleApprove(req: PaymentRequest) {
    setLoadingId(req.id);

    try {
      // Call Supabase RPC function to set Pro access for 30 days (1 Month)
      const { error } = await supabase.rpc("approve_payment_one_month", {
        p_payment_id: req.id,
        p_user_id: req.user_id,
      });

      if (error) {
        // Fallback update if RPC function is not installed yet
        await supabase
          .from("payment_requests")
          .update({ status: "approved" })
          .eq("id", req.id);

        const oneMonthFromNow = new Date();
        oneMonthFromNow.setDate(oneMonthFromNow.getDate() + 30);

        await supabase
          .from("profiles")
          .update({
            is_pro: true,
            trial_ends_at: null,
            pro_until: oneMonthFromNow.toISOString(),
          })
          .eq("id", req.user_id);
      }

      setRequests((prev) =>
        prev.map((r) => (r.id === req.id ? { ...r, status: "approved" } : r))
      );
    } catch (err: any) {
      alert("Failed to approve payment: " + err.message);
    } finally {
      setLoadingId(null);
    }
  }

  async function handleReject(req: PaymentRequest) {
    setLoadingId(req.id);

    try {
      await supabase
        .from("payment_requests")
        .update({ status: "rejected" })
        .eq("id", req.id);

      await supabase
        .from("profiles")
        .update({ is_pro: false, trial_ends_at: null, pro_until: null })
        .eq("id", req.user_id);

      setRequests((prev) =>
        prev.map((r) => (r.id === req.id ? { ...r, status: "rejected" } : r))
      );
    } catch (err: any) {
      alert("Failed to reject payment: " + err.message);
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#080b12] p-6 text-white sm:p-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                ← Back to Dashboard
              </Link>
              <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400">
                Admin Panel
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Payment Verification Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Logged in as <span className="font-medium text-white">{currentUserEmail}</span>
            </p>
          </div>
        </div>

        {/* Requests Table */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d111a]">
          <div className="border-b border-white/10 px-6 py-4">
            <h2 className="text-sm font-semibold text-slate-200">
              Submitted UTR Transactions ({requests.length})
            </h2>
          </div>

          {requests.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">
              No payment requests found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="border-b border-white/10 bg-white/5 text-xs text-slate-400">
                  <tr>
                    <th className="px-6 py-3.5 font-medium">User Email</th>
                    <th className="px-6 py-3.5 font-medium">UTR / Ref Number</th>
                    <th className="px-6 py-3.5 font-medium">Amount</th>
                    <th className="px-6 py-3.5 font-medium">Submitted Date</th>
                    <th className="px-6 py-3.5 font-medium">Status</th>
                    <th className="px-6 py-3.5 font-medium text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4 font-medium text-white">
                        {req.profiles?.email || req.user_id}
                      </td>

                      <td className="px-6 py-4 font-mono font-bold text-indigo-300 select-all">
                        {req.utr_number}
                      </td>

                      <td className="px-6 py-4 font-semibold text-emerald-400">
                        ₹{req.amount}
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-400">
                        {new Date(req.created_at).toLocaleString("en-IN")}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            req.status === "approved"
                              ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                              : req.status === "rejected"
                              ? "border border-rose-500/20 bg-rose-500/10 text-rose-400"
                              : "border border-amber-500/20 bg-amber-500/10 text-amber-400"
                          }`}
                        >
                          {req.status.toUpperCase()}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        {req.status === "pending" ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApprove(req)}
                              disabled={loadingId === req.id}
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                            >
                              Approve (+1 Mo)
                            </button>

                            <button
                              onClick={() => handleReject(req)}
                              disabled={loadingId === req.id}
                              className="rounded-lg border border-rose-500/30 bg-rose-600/20 px-3 py-1.5 text-xs font-medium text-rose-300 transition hover:bg-rose-600/30 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}