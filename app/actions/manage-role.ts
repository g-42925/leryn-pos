"use server"

import { connectToDatabase } from "@/lib/mongodb"
import { role } from "@/model/role"

export async function getRolesAction(accountId: string) {
  try {
    await connectToDatabase()

    // Fetch all roles for this account
    const rolesList = await role.find({ accountId }).sort({ createdAt: -1 })

    return { success: true, data: JSON.parse(JSON.stringify(rolesList)) }
  }
  catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function addRoleAction(accountId: string, name: string, permissions: string[]) {
  try {
    await connectToDatabase()

    // Check if role name already exists for this account
    const existing = await role.findOne({ accountId, name: { $regex: new RegExp(`^${name}$`, "i") } })

    if (existing) {
      return { success: false, message: "Nama peran (Role) ini sudah ada." }
    }

    const newRole = await role.create({
      accountId,
      name,
      permissions
    })

    return { success: true, data: JSON.parse(JSON.stringify(newRole)) }
  }
  catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function deleteRoleAction(roleId: string, accountId: string) {
  try {
    await connectToDatabase()
    const result = await role.findOneAndDelete({ _id: roleId, accountId })
    if (!result) return { success: false, message: "Role tidak ditemukan" }
    return { success: true }
  }
  catch (error: any) {
    return { success: false, message: error.message }
  }
}
