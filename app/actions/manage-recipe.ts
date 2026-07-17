"use server"

import { connectToDatabase } from "@/lib/mongodb"
import Recipe from "@/model/recipe"
import { inventoryItem as InventoryItem } from "@/model/inventory-item"

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
    // Query inventory items directly by branchId (InventoryItem has a branchId field)
    const items = await InventoryItem.find({ branchId, accountId }).sort({ name: 1 }).lean()
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
