"use server"

import { connectToDatabase } from "@/lib/mongodb"
import Customer from "@/model/customer"

export async function getCustomersAction(accountId: string) {
  try {
    await connectToDatabase()
    const customers = await Customer.find({ accountId }).sort({ createdAt: -1 }).lean()
    return { success: true, data: JSON.parse(JSON.stringify(customers)) }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function addCustomerAction(accountId: string, name: string, email: string, phone: string, address: string) {
  try {
    await connectToDatabase()

    const newCustomer = await Customer.create({
      accountId,
      name,
      email,
      phone,
      address
    })

    return { success: true, data: JSON.parse(JSON.stringify(newCustomer)) }
  } catch (error: any) {
    if (error.code === 11000) {
      return { success: false, message: "Customer dengan email tersebut sudah ada." }
    }
    return { success: false, message: error.message }
  }
}
