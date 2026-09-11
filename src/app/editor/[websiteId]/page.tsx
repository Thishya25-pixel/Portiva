import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditorClient from "./EditorClient";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ websiteId: string }>;
}) {
  const { websiteId } = await params;
  const supabase = await createClient();

  // 1. Authenticate User
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // 2. Fetch Website Details
  const { data: website, error: siteError } = await supabase
    .from("websites")
    .select("*")
    .eq("id", websiteId)
    .eq("user_id", user.id)
    .single();

  if (siteError || !website) {
    notFound();
  }

  // 3. Fetch All Content Sections for this Website
  const { data: sections } = await supabase
    .from("website_content")
    .select("section, content")
    .eq("website_id", websiteId);

  // 4. Map Array of Sections into a Clean Key-Value Object
  // e.g., { hero: { title: "..." }, about: { bio: "..." } }
  const initialContent: Record<string, any> = {};
  if (sections) {
    sections.forEach((item) => {
      initialContent[item.section] = item.content;
    });
  }

  return <EditorClient website={website} initialContent={initialContent} />;
}