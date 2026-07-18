import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Form } from "./form"

export default async function Login() {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")

  if (token) {
    redirect("/home")
  }

  return (
    <Form />
  );
}


