import { Schema, model, models } from "mongoose";

const MenuCategorySchema = new Schema(
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
    }
  },
  {
    timestamps: true,
  }
);

MenuCategorySchema.index({ accountId: 1, branchId: 1, name: 1 }, { unique: true });

export default models.MenuCategory || model("MenuCategory", MenuCategorySchema);
