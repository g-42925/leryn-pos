"use server"

import { connectToDatabase } from "@/lib/mongodb"
import Order from "@/model/order"

export async function getOrdersByStatusAction(
  accountId: string,
  branchId: string,
  status: "draft" | "active" | "completed"
) {
  try {
    await connectToDatabase()

    const orders = await Order.aggregate([
      { $match: { accountId, branchId, status } },
      {
        $lookup: {
          from: "staff",
          let: { sId: { $toObjectId: "$staffId" } },
          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$sId"] } } }],
          as: "staffData",
        },
      },
      {
        $addFields: {
          staffName: { $arrayElemAt: ["$staffData.name", 0] },
        },
      },
      { $project: { staffData: 0 } },
      { $sort: { createdAt: -1 } },
    ])

    return { success: true, data: JSON.parse(JSON.stringify(orders)) }
  } catch (error: unknown) {
    return { success: false, message: (error as Error).message, data: [] }
  }
}

export async function createOrderAction(
  accountId: string,
  branchId: string,
  staffId: string,
  tableId: string,
  tableName: string,
  tableAreaId: string,
  orderType: "dine-in" | "take-away",
  notes: string
) {
  try {
    await connectToDatabase()
    const newOrder = await Order.create({
      accountId,
      branchId,
      staffId,
      tableId,
      tableName,
      tableAreaId,
      orderType,
      notes,
      status: "draft",
      items: [],
      totalAmount: 0,
    })
    return { success: true, data: JSON.parse(JSON.stringify(newOrder)) }
  } catch (error: unknown) {
    return { success: false, message: (error as Error).message }
  }
}

export async function updateOrderStatusAction(
  orderId: string,
  accountId: string,
  status: "draft" | "active" | "completed"
) {
  try {
    await connectToDatabase()
    const updated = await Order.findOneAndUpdate(
      { _id: orderId, accountId },
      { $set: { status } },
      { new: true }
    )
    if (!updated) return { success: false, message: "Order tidak ditemukan." }
    return { success: true, data: JSON.parse(JSON.stringify(updated)) }
  } catch (error: unknown) {
    return { success: false, message: (error as Error).message }
  }
}

export async function deleteOrderAction(orderId: string, accountId: string) {
  try {
    await connectToDatabase()
    const deleted = await Order.findOneAndDelete({ _id: orderId, accountId, status: "draft" })
    if (!deleted) return { success: false, message: "Order tidak ditemukan atau bukan draft." }
    return { success: true }
  } catch (error: unknown) {
    return { success: false, message: (error as Error).message }
  }
}

export async function addOrderItemAction(
  orderId: string,
  accountId: string,
  item: {
    menuId: string
    menuName: string
    quantity: number
    price: number
    notes?: string
  }
) {
  try {
    await connectToDatabase()
    const order = await Order.findOne({ _id: orderId, accountId })
    if (!order) return { success: false, message: "Order tidak ditemukan." }

    order.items.push(item)
    order.totalAmount = order.items.reduce(
      (sum: number, i: { price: number; quantity: number }) => sum + i.price * i.quantity,
      0
    )
    await order.save()
    return { success: true, data: JSON.parse(JSON.stringify(order)) }
  } catch (error: unknown) {
    return { success: false, message: (error as Error).message }
  }
}
