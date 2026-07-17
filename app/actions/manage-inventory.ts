"use server"

import { connectToDatabase } from "@/lib/mongodb"
import { inventoryType } from "@/model/inventory-type"
import { inventoryItem } from "@/model/inventory-item"

export async function getInventoryTypesAction(accountId: string) {
  await connectToDatabase()
  const types = await inventoryType.find({ accountId }).sort({ createdAt: -1 }).lean()
  return JSON.parse(JSON.stringify(types))
}

export async function addInventoryTypeAction(accountId: string, name: string) {
  try {
    await connectToDatabase()
    const newType = await inventoryType.create({ accountId, name })
    return { success: true, data: JSON.parse(JSON.stringify(newType)) }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function getInventoryItemsAction(typeId: string, accountId: string) {
  await connectToDatabase()
  const type = await inventoryType.findOne({ _id: typeId, accountId }).lean()
  if (!type) {
    return { success: false, message: "Jenis inventory tidak ditemukan" }
  }

  const items = await inventoryItem.find({ inventoryTypeId: typeId, accountId }).sort({ createdAt: -1 }).lean()

  return {
    success: true,
    type: JSON.parse(JSON.stringify(type)),
    items: JSON.parse(JSON.stringify(items))
  }
}

export async function addInventoryItemAction(typeId: string, accountId: string, name: string, unit: string, branchId: string) {
  try {
    await connectToDatabase()
    // By default, mongoose will use the default stock: 0
    const newItem = await inventoryItem.create({ inventoryTypeId: typeId, accountId, branchId, name, unit })
    return { success: true, data: JSON.parse(JSON.stringify(newItem)) }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function updateStockAction(itemId: string, accountId: string, type: 'in' | 'out', amount: number) {
  try {
    await connectToDatabase()

    if (amount <= 0) return { success: false, message: "Jumlah harus lebih dari 0" }

    const item = await inventoryItem.findOne({ _id: itemId, accountId })
    if (!item) return { success: false, message: "Item tidak ditemukan" }

    if (type === 'out' && item.stock < amount) {
      return { success: false, message: "Stock tidak mencukupi" }
    }

    const change = type === 'in' ? amount : -amount
    item.stock += change
    await item.save()

    return { success: true, data: JSON.parse(JSON.stringify(item)) }
  }
  catch (error: any) {
    return { success: false, message: error.message }
  }
}
