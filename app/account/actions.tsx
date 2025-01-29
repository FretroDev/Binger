"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function handleLogout(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export const handlePrivacyToggle = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: userSettings } = await supabase
    .from("user_settings")
    .select("is_public")
    .eq("id", user.id)
    .single();

  if (!userSettings) return;
  await supabase.from("user_settings").upsert({
    id: user.id,
    is_public: !userSettings.is_public,
  });

  revalidatePath("/account", "layout");
  redirect("/account");
};
