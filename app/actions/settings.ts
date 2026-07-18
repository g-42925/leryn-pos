"use server"

import { connectToDatabase } from "@/lib/mongodb"
import Staff from "@/model/staff"

export async function getStaffListAction(accountId: string) {
  try {
    await connectToDatabase()
    const staffList = await Staff.find({ accountId })
      .select("_id name role branchId")
      .sort({ name: 1 })
      .lean()

    return { success: true, data: JSON.parse(JSON.stringify(staffList)) }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function changeStaffPasswordAction(
  accountId: string,
  staffId: string,
  newPin: string
) {
  try {
    await connectToDatabase()

    if (!newPin || newPin.length < 4) {
      return { success: false, message: "PIN minimal 4 karakter." }
    }

    const staff = await Staff.findOne({ _id: staffId, accountId })
    if (!staff) {
      return { success: false, message: "Staff tidak ditemukan." }
    }

    staff.pin = newPin
    await staff.save()

    return { success: true, message: "Password/PIN staff berhasil diperbarui." }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}
