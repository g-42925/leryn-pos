"use server"

import { connectToDatabase } from "@/lib/mongodb"
import Staff from "@/model/staff"
import Branch from "@/model/branch"

export async function getStaffAction(accountId: string) {
  try {
    await connectToDatabase()
    
    // Aggregation to fetch staff with their assigned branch details
    const staffList = await Staff.aggregate([
      { $match: { accountId } },
      {
        $lookup: {
          from: "branches", 
          let: { brnId: { $toObjectId: "$branchId" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$brnId"] } } }
          ],
          as: "branchData"
        }
      },
      {
        $addFields: {
          branchName: { $arrayElemAt: ["$branchData.name", 0] }
        }
      },
      {
        $project: {
          branchData: 0
        }
      },
      { $sort: { createdAt: -1 } }
    ])

    return { success: true, data: JSON.parse(JSON.stringify(staffList)) }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function addStaffAction(accountId: string, branchId: string, name: string, pin: string, role: string = "cashier") {
  try {
    await connectToDatabase()
    
    const newStaff = await Staff.create({ 
      accountId, 
      branchId, 
      name, 
      pin, 
      role 
    })
    return { success: true, data: JSON.parse(JSON.stringify(newStaff)) }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}
