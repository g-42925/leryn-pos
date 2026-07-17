"use client"

import { useEffect, useState } from "react"
import useGlobalState from "@/store/global"
import { getBranchesAction } from "@/app/actions/manage-branch"
import { GitBranch, ShieldCheck } from "lucide-react"

export default function DashboardHeader() {
  const { accountId, role, branch: userBranchId, hasHydrated } = useGlobalState()
  const isSuperadmin = role === "superadmin"

  const [branchName, setBranchName] = useState<string | null>(null)

  useEffect(() => {
    if (!hasHydrated || !accountId || isSuperadmin || !userBranchId) return

    getBranchesAction(accountId).then((res) => {
      if (res.success && res.data) {
        const found = res.data.find((b: { _id: string; name: string }) => b._id === userBranchId)
        if (found) setBranchName(found.name)
      }
    })
  }, [hasHydrated, accountId, isSuperadmin, userBranchId])

  if (!hasHydrated) return null

  return (
    <div>
      <h1 className="text-4xl font-extrabold tracking-tight">Admin Dashboard</h1>
      <p className="text-slate-500 dark:text-slate-400 mt-2">
        Manage your restaurant operations efficiently.
      </p>

      {/* Role & Branch Badge */}
      <div className="flex items-center gap-2 mt-4 flex-wrap">
        {isSuperadmin ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-sm shadow-violet-300 dark:shadow-violet-900">
            <ShieldCheck size={13} />
            Superadmin
          </span>
        ) : (
          <>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-500 to-sky-600 text-white shadow-sm shadow-indigo-300 dark:shadow-indigo-900 capitalize">
              <ShieldCheck size={13} />
              {role || "Admin"}
            </span>
            {branchName ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-300 dark:shadow-emerald-900">
                <GitBranch size={13} />
                {branchName}
              </span>
            ) : userBranchId ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300">
                <GitBranch size={13} />
                Memuat cabang...
              </span>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
