import { Schema, model, models } from "mongoose";

const InventoryTypeSchema = new Schema(
  {
    accountId: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

InventoryTypeSchema.index({ accountId: 1, name: 1 }, { unique: true });

const inventoryType = models.InventoryType || model("InventoryType", InventoryTypeSchema);

export {
  inventoryType
}
