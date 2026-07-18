import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Content } from "./content"

export default async function Home() {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")

  if (!token) redirect("/login")

  return <Content />
}
