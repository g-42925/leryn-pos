"use server"

import { cookies } from "next/headers"
import { connectToDatabase } from "@/lib/mongodb"
import Staff from "@/model/staff"
import Branch from "@/model/branch"

export interface StaffLoginResponse {
  _id: string
  name: string
  branchId: string
  branchName: string
  accountId: string
  role: string
}

export interface FormState<T> {
  success: boolean
  message: string
  result?: T
}

export async function getBranchesForAccountAction(accountId: string) {
  try {
    await connectToDatabase()

    const branches = await Branch.find({ accountId }, { name: 1 }).sort({ name: 1 }).lean()

    return {
      success: true,
      data: JSON.parse(JSON.stringify(branches)),
    }
  }
  catch (error: unknown) {
    return { success: false, message: (error as Error).message, data: [] }
  }
}

export async function getStaffListAction(accountId: string, branchId?: string) {
  try {
    await connectToDatabase()
    const query: Record<string, string> = { accountId }
    if (branchId) query.branchId = branchId

    const staffList = await Staff.find(query, { name: 1, role: 1 })
      .sort({ name: 1 })
      .lean()
    return {
      success: true,
      data: JSON.parse(JSON.stringify(staffList)),
    }
  } catch (error: unknown) {
    return { success: false, message: (error as Error).message, data: [] }
  }
}

export async function staffLoginAction<T>(
  prevState: FormState<T>,
  formData: FormData
): Promise<FormState<T>> {
  try {
    await connectToDatabase()

    const staffId = formData.get("staffId") as string
    const pin = formData.get("pin") as string

    if (!staffId || !pin) return { success: false, message: "Pilih nama staff dan masukkan PIN." }

    const staff = await Staff.findById(staffId).lean()

    // Fetch branch name
    const branch = await Branch.findById(staff.branchId, { name: 1 }).lean()

    const cookieStore = await cookies()
    // Store staffId|branchId|accountId in cookie value
    const tokenValue = `${staff._id.toString()}|${staff.branchId}|${staff.accountId}`
    cookieStore.set("staff_session_token", tokenValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 12, // 12 hours
      path: "/",
    })

    const result = {
      _id: staff._id.toString(),
      name: staff.name,
      branchId: staff.branchId,
      branchName: branch?.name ?? "",
      accountId: staff.accountId,
      role: staff.role,
    }

    return {
      success: true,
      message: `Selamat datang, ${staff.name}!`,
      result: result as T,
    }
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan",
    }
  }
}
