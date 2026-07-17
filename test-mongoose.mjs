import mongoose from "mongoose";

const RecipeIngredientSchema = new mongoose.Schema(
  {
    inventoryItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
    quantity: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);
const RecipeSchema = new mongoose.Schema({
  accountId: { type: String, required: true, trim: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  name: { type: String, required: true, trim: true },
  ingredients: [RecipeIngredientSchema]
}, { timestamps: true });
const Recipe = mongoose.models.Recipe || mongoose.model("Recipe", RecipeSchema);

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/pos");
  const all = await Recipe.find().lean();
  console.log("All recipes:");
  for (const r of all) {
    console.log(r.name, r.branchId ? r.branchId.toString() : "NO BRANCH");
  }
  process.exit();
}
run().catch(console.error);
