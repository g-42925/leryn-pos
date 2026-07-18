"use server"

import { connectToDatabase } from "@/lib/mongodb"
import Branch from "@/model/branch"
import InventoryType from "@/model/inventory-type"

export async function getBranchesAction(accountId: string) {
  try {
    await connectToDatabase()
    
    // We can also fetch the inventory type details using aggregation or simply fetching after
    const branches = await Branch.aggregate([
      { $match: { accountId } },
      {
        $lookup: {
          from: "inventorytypes", 
          let: { invId: { $toObjectId: "$inventoryId" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$invId"] } } }
          ],
          as: "inventoryData"
        }
      },
      {
        $addFields: {
          inventoryName: { $arrayElemAt: ["$inventoryData.name", 0] }
        }
      },
      {
        $project: {
          inventoryData: 0
        }
      },
      { $sort: { createdAt: -1 } }
    ])

    return { success: true, data: JSON.parse(JSON.stringify(branches)) }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function addBranchAction(accountId: string, name: string, address: string, inventoryId: string) {
  try {
    await connectToDatabase()
    
    const newBranch = await Branch.create({ accountId, name, address, inventoryId })
    return { success: true, data: JSON.parse(JSON.stringify(newBranch)) }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}
