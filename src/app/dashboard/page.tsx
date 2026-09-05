import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  // Fetch websites owned by this user
  const { data: websites } = await supabase
    .from("websites")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return <DashboardClient user={user} initialWebsites={websites || []} />;
}