"use server"

import { connectToDatabase } from "@/lib/mongodb"
import TableArea from "@/model/table-area"
import Table from "@/model/table"

export async function getTableAreasAction(accountId: string, branchId: string) {
  try {
    await connectToDatabase()
    const areas = await TableArea.find({ accountId, branchId }).sort({ createdAt: -1 }).lean()
    return { success: true, data: JSON.parse(JSON.stringify(areas)) }
  } catch (error: unknown) {
    return { success: false, message: (error as Error).message }
  }
}

export async function addTableAreaAction(accountId: string, branchId: string, name: string) {
  try {
    await connectToDatabase()
    const newArea = await TableArea.create({
      accountId,
      branchId,
      name
    })
    return { success: true, data: JSON.parse(JSON.stringify(newArea)) }
  } catch (error: unknown) {
    if ((error as any).code === 11000) {
      return { success: false, message: "Area table dengan nama tersebut sudah ada" }
    }
    return { success: false, message: (error as Error).message }
  }
}

export async function getTablesAction(accountId: string, tableAreaId: string) {
  try {
    await connectToDatabase()
    const tables = await Table.find({ accountId, tableAreaId }).sort({ createdAt: -1 }).lean()
    return { success: true, data: JSON.parse(JSON.stringify(tables)) }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function getBranchTablesAction(accountId: string, branchId: string) {
  try {
    await connectToDatabase()
    const tables = await Table.find({ accountId, branchId }).sort({ createdAt: -1 }).lean()
    return { success: true, data: JSON.parse(JSON.stringify(tables)) }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function addTableAction(accountId: string, branchId: string, tableAreaId: string, name: string, capacity: number) {
  try {
    await connectToDatabase()
    
    if (capacity <= 0) {
      return { success: false, message: "Kapasitas meja harus lebih dari 0" }
    }

    const newTable = await Table.create({
      accountId,
      branchId,
      tableAreaId,
      name,
      capacity,
    })

    return { success: true, data: JSON.parse(JSON.stringify(newTable)) }
  } catch (error: unknown) {
    if ((error as any).code === 11000) {
      return { success: false, message: "Meja dengan nama tersebut sudah ada" }
    }
    return { success: false, message: (error as Error).message }
  }
}

export async function updateTablePositionAction(accountId: string, tableId: string, x: number, y: number) {
  try {
    await connectToDatabase()
    const updatedTable = await Table.findOneAndUpdate(
      { _id: tableId, accountId },
      { $set: { x, y } },
      { new: true }
    )
    if (!updatedTable) {
      return { success: false, message: "Meja tidak ditemukan" }
    }
    return { success: true, data: JSON.parse(JSON.stringify(updatedTable)) }
  } catch (error: unknown) {
    return { success: false, message: (error as Error).message }
  }
}

