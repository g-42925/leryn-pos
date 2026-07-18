import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { StaffLoginForm } from "./form"

export default async function StaffLoginPage() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session_token")
  const staffToken = cookieStore.get("staff_session_token")

  // Must be logged in as account first
  if (!sessionToken) redirect("/login")

  // Already logged in as staff
  if (staffToken) redirect("/staff-dashboard")

  // Fetch account and branches server-side
  // The session_token carries the accountId via the global store (client-side)
  // We pass branches as props – but we need accountId from somewhere.
  // Since session_token is a simple flag cookie (not JWT), we can't decode it here.
  // We'll pass an empty accountId and let the client use the global store.

  return <StaffLoginForm />
}
