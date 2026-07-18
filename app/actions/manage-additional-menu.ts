"use server"

import { connectToDatabase } from "@/lib/mongodb"
import AdditionalMenu from "@/model/additional-menu"
import Menu from "@/model/menu"

export async function getAdditionalMenusAction(accountId: string) {
  try {
    await connectToDatabase()
    const additionalMenus = await AdditionalMenu.find({ accountId })
      .populate('branchId', 'name')
      .populate('menuId', 'name')
      .sort({ createdAt: -1 })
      .lean()
      
    // Additional sanity checks, if Branch or Menu got deleted but orphan additional menus exist
    const validData = additionalMenus.filter((item: any) => item.branchId && item.menuId)
    
    return { success: true, data: JSON.parse(JSON.stringify(validData)) }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function getBranchMenusAction(branchId: string, accountId: string) {
  try {
    await connectToDatabase()
    const menus = await Menu.find({ branchId, accountId }).sort({ name: 1 }).lean()
    
    return { success: true, data: JSON.parse(JSON.stringify(menus)) }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function addAdditionalMenuAction(accountId: string, branchId: string, menuId: string, name: string, price: number) {
  try {
    await connectToDatabase()
    
    if (price < 0) {
      return { success: false, message: "Harga tidak boleh negatif" }
    }

    const newAdditionalMenu = await AdditionalMenu.create({
      accountId,
      branchId,
      menuId,
      name,
      price
    })

    const populatedMenu = await AdditionalMenu.findById(newAdditionalMenu._id)
      .populate('branchId', 'name')
      .populate('menuId', 'name')
      .lean()

    return { success: true, data: JSON.parse(JSON.stringify(populatedMenu)) }
  } catch (error: any) {
    if (error.code === 11000) {
      return { success: false, message: "Menu tambahan dengan nama tersebut sudah ada di menu utama ini" }
    }
    return { success: false, message: error.message }
  }
}
