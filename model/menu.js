import { Schema, model, models } from "mongoose";

const MenuSchema = new Schema(
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
    recipeId: {
      type: Schema.Types.ObjectId,
      ref: 'Recipe',
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'MenuCategory',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    taxIncluded: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

MenuSchema.index({ accountId: 1, branchId: 1, name: 1 }, { unique: true });

export default models.Menu || model("Menu", MenuSchema);
