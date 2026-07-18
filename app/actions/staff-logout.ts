"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function staffLogoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete("staff_session_token")
  redirect("/home")
}
