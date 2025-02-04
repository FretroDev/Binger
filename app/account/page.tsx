"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import AccountPage from "./account-page"

export default async function Page() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect("/login")
  }

  // Get user settings
  const { data: settings } = await supabase
    .from("user_settings")
    .select("*")
    .eq("id", user.id)
    .single()

  return <AccountPage user={user} initialSettings={settings} />
}