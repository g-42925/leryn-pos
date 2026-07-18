import { Schema, model, models } from "mongoose";

const RecipeIngredientSchema = new Schema(
  {
    inventoryItemId: {
      type: Schema.Types.ObjectId,
      ref: 'InventoryItem',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    }
  },
  { _id: false }
);

const RecipeSchema = new Schema(
  {
    accountId: {
      type: String,
      required: true,
      trim: true,
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    ingredients: [RecipeIngredientSchema]
  },
  {
    timestamps: true,
  }
);

RecipeSchema.index({ accountId: 1, branchId: 1, name: 1 }, { unique: true });

export default models.Recipe || model("Recipe", RecipeSchema);
