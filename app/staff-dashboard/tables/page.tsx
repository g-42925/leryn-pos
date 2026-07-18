import { cookies } from "next/headers"
import { getTableAreasAction, getBranchTablesAction } from "@/app/actions/manage-table"
import { TableMap } from "./table-map"
import { LayoutDashboard } from "lucide-react"

export default async function StaffTablesPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("staff_session_token")?.value
  if (!token) return null

  const [, branchId, accountId] = token.split("|")
  if (!branchId || !accountId) return null

  // Fetch all areas and tables for this branch/account
  const areasRes = await getTableAreasAction(accountId, branchId)
  const tablesRes = await getBranchTablesAction(accountId, branchId)

  const areas = areasRes.data || []
  const tables = tablesRes.data || []

  if (areas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
          <LayoutDashboard size={40} className="text-gray-300" />
        </div>
        <p className="font-medium text-lg">Belum ada peta meja (Area) untuk cabang ini</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="flex-1 p-6 relative overflow-hidden bg-gray-50/50">
        <TableMap areas={areas} tables={tables} />
      </div>
    </div>
  )
}
