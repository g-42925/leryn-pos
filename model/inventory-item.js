import { Schema, model, models } from "mongoose";

const InventoryItemSchema = new Schema(
  {
    inventoryTypeId: {
      type: Schema.Types.ObjectId,
      ref: 'InventoryType',
      required: true,
    },
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
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    stock: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

InventoryItemSchema.index({ inventoryTypeId: 1, name: 1 }, { unique: true });

export default models.InventoryItem || model("InventoryItem", InventoryItemSchema);
