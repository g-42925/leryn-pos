"use server"

import { connectToDatabase } from "@/lib/mongodb"
import { permission } from "@/model/permission"

export async function getPermissionsAction(accountId: string) {
  try {
    await connectToDatabase()

    // Fetch all permissions for this account
    const docs = await permission.find().sort({ createdAt: -1 })

    return { success: true, data: JSON.parse(JSON.stringify(docs)) }
  } catch (error) {
    const err = error as Error
    return { success: false, message: err.message }
  }
}

export async function addPermissionAction(accountId: string, name: string, description: string) {
  try {
    await connectToDatabase()

    // Check if permission name already exists for this account
    const existing = await permission.findOne({ accountId, name: { $regex: new RegExp(`^${name}$`, "i") } })
    if (existing) {
      return { success: false, message: "Akses permission ini sudah ada." }
    }

    const newDoc = await permission.create({
      accountId,
      name,
      description
    })

    return { success: true, data: JSON.parse(JSON.stringify(newDoc)) }
  } catch (error) {
    const err = error as Error
    return { success: false, message: err.message }
  }
}

export async function deletePermissionAction(permissionId: string, accountId: string) {
  try {
    await connectToDatabase()
    const result = await permission.findOneAndDelete({ _id: permissionId, accountId })
    if (!result) return { success: false, message: "Permission tidak ditemukan" }
    return { success: true }
  } catch (error) {
    const err = error as Error
    return { success: false, message: err.message }
  }
}
