"use server"

import { connectToDatabase } from "@/lib/mongodb"
import Recipe from "@/model/recipe"
import Branch from "@/model/branch"
import InventoryItem from "@/model/inventory-item"

export async function getRecipesAction(accountId: string) {
  try {
    await connectToDatabase()
    const recipes = await Recipe.find({ accountId }).populate('branchId', 'name').sort({ createdAt: -1 }).lean()
    return { success: true, data: JSON.parse(JSON.stringify(recipes)) }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function getBranchInventoryItemsAction(branchId: string, accountId: string) {
  try {
    await connectToDatabase()
    const branch = await Branch.findOne({ _id: branchId, accountId }).lean()
    if (!branch) {
      return { success: false, message: "Branch tidak ditemukan" }
    }
    
    // branch.inventoryId determines the type of inventory items this branch uses
    const items = await InventoryItem.find({ inventoryTypeId: branch.inventoryId, accountId }).sort({ name: 1 }).lean()
    
    return { success: true, data: JSON.parse(JSON.stringify(items)) }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function addRecipeAction(accountId: string, branchId: string, name: string, ingredients: { inventoryItemId: string, quantity: number }[]) {
  try {
    await connectToDatabase()
    
    if (!ingredients || ingredients.length === 0) {
      return { success: false, message: "Bahan baku minimal 1" }
    }

    const newRecipe = await Recipe.create({
      accountId,
      branchId,
      name,
      ingredients
    })

    return { success: true, data: JSON.parse(JSON.stringify(newRecipe)) }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}
