"use server"

import { connectToDatabase } from "@/lib/mongodb"
import { admin } from "@/model/admin"
import { role } from "@/model/role"
import { branch } from "@/model/branch"
import bcrypt from "bcrypt"

export async function getAdminsAction(accountId: string) {
  console.log("test")

  try {
    await connectToDatabase()

    console.log("test 2")

    // Attempting to look up roles if possible, or just returning admin data

    const adminList = await admin.aggregate([
      {
        $match: {
          accountId: accountId,
          role: { $ne: "superadmin" }
        }
      },
      {
        $lookup: {
          from: "roles",
          let: { role: '$role' },
          pipeline: [
            { $match: { $expr: { $eq: ["$name", "$$role"] } } }
          ],
          as: "roleData"
        }
      },
      {
        $addFields: {
          permissions: {
            $map: {
              input: { $arrayElemAt: ["$roleData.permissions", 0] },
              as: "id",
              in: { $toObjectId: "$$id" }
            }
          }
        }
      },
      {
        $lookup: {
          from: "permissions",
          localField: "permissions",
          foreignField: "_id",
          as: "permissions"
        }
      },
      {
        $project: {
          roleData: 0,
          password: 0
        }
      },
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $project: {
          roleData: 0,
          password: 0 // Do not return password
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ])

    return {
      success: true,
      data: JSON.parse(JSON.stringify(adminList))
    }
  }
  catch (error: any) {
    return {
      success: false,
      message: error.message
    }
  }
}

export async function addAdminAction(accountId: string, username: string, name: string, passwordRaw: string, roleId: string, branchId: string) {
  try {
    await connectToDatabase()

    // Check if username exists globally or per account?
    const existing = await admin.findOne({ username })

    if (existing) return { success: false, message: "Username sudah digunakan!" }

    const _role = await role.findById(roleId)

    const password = await bcrypt.hash(passwordRaw, 10)

    const newAdmin = await admin.create({
      accountId,
      username,
      name,
      password,
      role: _role.name,
      branch: branchId,
    })

    const plainAdmin = newAdmin.toObject()
    delete plainAdmin.password

    return { success: true, data: JSON.parse(JSON.stringify(plainAdmin)) }
  }
  catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function deleteAdminAction(adminId: string, accountId: string) {
  try {
    await connectToDatabase()

    const result = await admin.deleteOne({ _id: adminId, accountId })
    if (result.deletedCount === 0) {
      return { success: false, message: "Admin tidak ditemukan atau gagal dihapus." }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}


// export async function getBranchesAction(accountId: string) {
//   try {
//     await connectToDatabase()

//     const branches = await branch.find({ accountId })

//     return {
//       success: true,
//       data: JSON.parse(JSON.stringify(branches))
//     }
//   }
//   catch (error: any) {
//     return {
//       success: false,
//       message: error.message
//     }
//   }
// }