"use server"

import { connectToDatabase } from "@/lib/mongodb"
import Order from "@/model/order"

export async function getOrdersAction(accountId: string, branchId: string, status: string) {
  try {
    await connectToDatabase()
    const orders = await Order.find({ accountId, branchId, status })
      .sort({ createdAt: -1 })
      .lean()
      
    return { success: true, data: JSON.parse(JSON.stringify(orders)) }
  } catch (error: any) {
    return { success: false, message: error.message, data: [] }
  }
}
