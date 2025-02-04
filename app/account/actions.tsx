"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const handleLogout = async () => {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  await supabase.auth.signOut();
  revalidatePath("/");
  redirect("/");
};

export const handlePrivacyToggle = async (is_public: boolean) => {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  await supabase.from("user_settings").upsert({
    id: data.user.id,
    is_public: is_public,
  });

  if (error) {
    console.error("Failed to update privacy settings", error);
  }
  revalidatePath("/account");
};

export const handleAccountDeletion = async () => {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  await supabase.auth.admin.deleteUser(data.user.id);

  revalidatePath("/");
  redirect("/");
};
