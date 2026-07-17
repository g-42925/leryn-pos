import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Recipe from "@/model/recipe";

export async function GET(request: Request) {
  await connectToDatabase();
  const recipes = await Recipe.find().lean();
  return NextResponse.json({
    total: recipes.length,
    recipes: recipes.map((r: any) => ({
      name: r.name,
      branchId: r.branchId,
      accountId: r.accountId
    }))
  });
}
