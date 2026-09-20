import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminPaymentsClient from "./AdminPaymentsClient";

// ⚠️ REPLACE THIS WITH YOUR EXACT LOGIN EMAIL ADDRESS
const ADMIN_EMAIL = "thishyaradhya25@gmail.com"; 

export default async function AdminPaymentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. If not logged in -> Redirect to login page
  if (!user) {
    redirect("/login");
  }

  // 2. If logged in but NOT the Admin -> Redirect to regular dashboard
  if (user.email !== ADMIN_EMAIL) {
    redirect("/dashboard");
  }

  // 3. Only your admin user gets access to fetch & verify payment requests
  const { data: requests, error } = await supabase
    .from("payment_requests")
    .select("*, profiles:user_id(email, full_name)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching payment requests:", error.message);
  }

  return (
    <AdminPaymentsClient
      currentUserEmail={user.email || ""}
      initialRequests={requests || []}
    />
  );
}