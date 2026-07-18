import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { StaffNavigation } from "./navigation"
import Staff from "@/model/staff"
import Branch from "@/model/branch"
import { connectToDatabase } from "@/lib/mongodb"

export default async function StaffDashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const staffToken = cookieStore.get("staff_session_token")?.value

  if (!staffToken) redirect("/staff-login")

  const [staffId, branchId, accountId] = staffToken.split("|")
  if (!staffId || !branchId || !accountId) {
    redirect("/staff-login")
  }

  await connectToDatabase()
  const staff = await Staff.findById(staffId).select("name").lean()
  const branch = await Branch.findById(branchId).select("name").lean()

  if (!staff || !branch) {
    redirect("/staff-login")
  }

  return (
    <div className="flex h-screen bg-gray-50/50">
      <StaffNavigation name={staff.name} branchName={branch.name} />
      <main className="flex-1 overflow-auto bg-[#f8fafc]">
        {children}
      </main>
    </div>
  )
}
