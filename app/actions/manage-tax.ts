"use server"

import { connectToDatabase } from "@/lib/mongodb"
import Tax from "@/model/tax"

export async function getTaxesAction(accountId: string) {
  try {
    await connectToDatabase()
    const taxes = await Tax.find({ accountId }).sort({ createdAt: -1 }).lean()
    return { success: true, data: JSON.parse(JSON.stringify(taxes)) }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function addTaxAction(accountId: string, name: string, percentage: number) {
  try {
    await connectToDatabase()
    
    if (percentage < 0) {
      return { success: false, message: "Persentase tidak boleh negatif" }
    }

    const newTax = await Tax.create({
      accountId,
      name,
      percentage
    })

    return { success: true, data: JSON.parse(JSON.stringify(newTax)) }
  } catch (error: any) {
    if (error.code === 11000) {
      return { success: false, message: "Tax dengan nama tersebut sudah ada" }
    }
    return { success: false, message: error.message }
  }
}
