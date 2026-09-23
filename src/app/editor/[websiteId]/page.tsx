import { createClient } from "@/lib/supabase/server";
import EditorClient from "./EditorClient";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ websiteId: string }>;
}) {
  const { websiteId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch profile to evaluate active Pro or Trial status
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single();

  const isPro = Boolean(
    profile?.is_pro &&
      ((profile?.pro_until && new Date(profile.pro_until) > new Date()) ||
        (profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date()))
  );

  const { data: website } = await supabase
    .from("websites")
    .select("*")
    .eq("id", websiteId)
    .single();

  const { data: contentRows } = await supabase
    .from("website_content")
    .select("*")
    .eq("website_id", websiteId);

  const initialContent = (contentRows || []).reduce(
    (acc: Record<string, any>, row: { section: string; content: any }) => {
      acc[row.section] = row.content;
      return acc;
    },
    {} as Record<string, any>
  );

  return (
    <EditorClient
      website={website}
      initialContent={initialContent}
      isPro={isPro}
      userId={user?.id}
    />
  );
}