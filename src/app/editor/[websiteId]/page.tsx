import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditorClient from "./EditorClient";

interface PageProps {
  params: Promise<{ websiteId: string }>;
}

export default async function EditorPage({ params }: PageProps) {
  const { websiteId } = await params;
  const supabase = await createClient();

  // 1. Verify Authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // 2. Fetch target website owned by user
  const { data: website, error: websiteError } = await supabase
    .from("websites")
    .select("*")
    .eq("id", websiteId)
    .eq("user_id", user.id)
    .single();

  if (websiteError || !website) {
    notFound();
  }

  // 3. Fetch website section contents
  const { data: contentRows } = await supabase
    .from("website_content")
    .select("section, content")
    .eq("website_id", websiteId);

  // Map array of rows into key-value object { hero: {...}, about: {...} }
  const initialContent: Record<string, any> = {};
  if (contentRows) {
    for (const row of contentRows) {
      initialContent[row.section] = row.content;
    }
  }

  return <EditorClient website={website} initialContent={initialContent} />;
}