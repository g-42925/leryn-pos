import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Form } from "./form"

export default async function AdminLogin() {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")
  const adminToken = cookieStore.get("admin_session_token")

  if (!token) redirect("/login")

  if (adminToken) redirect("/admin-dashboard")

  return <Form />
}
