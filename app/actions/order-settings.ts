"use server"

import { connectToDatabase } from "@/lib/mongodb"
import OrderSettings from "@/model/order-settings"

// ─── GET ────────────────────────────────────────────────────────────────────

export async function getOrderSettingsAction(accountId: string, branchId: string) {
  try {
    await connectToDatabase()
    let settings = await OrderSettings.findOne({ accountId, branchId }).lean()

    // Return default shape if not yet saved
    if (!settings) {
      settings = {
        accountId,
        branchId,
        takeAway: { enabled: true, serviceCharges: [] },
        dineIn: { enabled: true, serviceCharges: [] },
      }
    }

    return { success: true, data: JSON.parse(JSON.stringify(settings)) }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

// ─── TOGGLE ENABLE/DISABLE ──────────────────────────────────────────────────

export async function toggleOrderTypeAction(
  accountId: string,
  branchId: string,
  orderType: "takeAway" | "dineIn",
  enabled: boolean
) {
  try {
    await connectToDatabase()
    const update = { [`${orderType}.enabled`]: enabled }
    await OrderSettings.findOneAndUpdate(
      { accountId, branchId },
      { $set: update },
      { upsert: true, new: true }
    )
    return { success: true }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

// ─── ADD SERVICE CHARGE ─────────────────────────────────────────────────────

export async function addServiceChargeAction(
  accountId: string,
  branchId: string,
  orderType: "takeAway" | "dineIn",
  name: string,
  percentage: number
) {
  try {
    await connectToDatabase()

    if (!name.trim()) return { success: false, message: "Nama service charge wajib diisi." }
    if (percentage < 0) return { success: false, message: "Persentase tidak boleh negatif." }

    const update = { $push: { [`${orderType}.serviceCharges`]: { name: name.trim(), percentage } } }
    await OrderSettings.findOneAndUpdate(
      { accountId, branchId },
      update,
      { upsert: true, new: true }
    )

    return { success: true }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

// ─── DELETE SERVICE CHARGE ──────────────────────────────────────────────────

export async function deleteServiceChargeAction(
  accountId: string,
  branchId: string,
  orderType: "takeAway" | "dineIn",
  chargeId: string
) {
  try {
    await connectToDatabase()

    const update = { $pull: { [`${orderType}.serviceCharges`]: { _id: chargeId } } }
    await OrderSettings.findOneAndUpdate({ accountId, branchId }, update)

    return { success: true }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}
