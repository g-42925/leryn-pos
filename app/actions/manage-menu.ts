"use server"

import { connectToDatabase } from "@/lib/mongodb"
import Menu from "@/model/menu"
import Recipe from "@/model/recipe"
import MenuCategory from "@/model/menu-category"
import mongoose from "mongoose"

export async function getMenusAction(accountId: string) {
  try {
    await connectToDatabase()
    const menus = await Menu.find({ accountId })
      .populate('branchId', 'name')
      .populate('recipeId', 'name')
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 })
      .lean()
    return { success: true, data: JSON.parse(JSON.stringify(menus)) }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function getBranchRecipesAction(branchId: string, accountId: string) {
  try {
    await connectToDatabase()
    if (!mongoose.Types.ObjectId.isValid(branchId)) {
      return { success: true, data: [] }
    }
    const recipes = await Recipe.find({
      branchId: new mongoose.Types.ObjectId(branchId),
      accountId
    }).sort({ name: 1 }).lean()
    return { success: true, data: JSON.parse(JSON.stringify(recipes)) }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function getBranchCategoriesAction(branchId: string, accountId: string) {
  try {
    await connectToDatabase()
    if (!mongoose.Types.ObjectId.isValid(branchId)) {
      return { success: true, data: [] }
    }
    const categories = await MenuCategory.find({
      branchId: new mongoose.Types.ObjectId(branchId),
      accountId
    }).sort({ name: 1 }).lean()
    return { success: true, data: JSON.parse(JSON.stringify(categories)) }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function addMenuCategoryAction(accountId: string, branchId: string, name: string) {
  try {
    await connectToDatabase()
    
    const newCategory = await MenuCategory.create({
      accountId,
      branchId,
      name
    })

    return { success: true, data: JSON.parse(JSON.stringify(newCategory)) }
  } catch (error: any) {
    if (error.code === 11000) {
      return { success: false, message: "Kategori dengan nama tersebut sudah ada di cabang ini" }
    }
    return { success: false, message: error.message }
  }
}

export async function addMenuAction(accountId: string, branchId: string, categoryId: string, recipeId: string, name: string, price: number, taxIncluded: boolean = false) {
  try {
    await connectToDatabase()
    
    if (price < 0) {
      return { success: false, message: "Harga tidak boleh negatif" }
    }

    const newMenu = await Menu.create({
      accountId,
      branchId,
      categoryId,
      recipeId,
      name,
      price,
      taxIncluded
    })

    return { success: true, data: JSON.parse(JSON.stringify(newMenu)) }
  } catch (error: any) {
    if (error.code === 11000) {
      return { success: false, message: "Menu dengan nama tersebut sudah ada di cabang ini" }
    }
    return { success: false, message: error.message }
  }
}
