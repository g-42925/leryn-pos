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
    stockUnit: {
      type: String,
      required: true,
      trim: true,
    },
    usageUnit: {
      type: String,
      required: true,
      trim: true,
    },
    conversionValue: {
      type: Number,
      required: true,
      min: 1,
    },
    stockQty: {
      type: Number,
      default: 0,
    },
    usageQty: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

InventoryItemSchema.index({ inventoryTypeId: 1, branchId: 1, name: 1 }, { unique: true });

const inventoryItem = models.InventoryItem || model("InventoryItem", InventoryItemSchema);

export {
  inventoryItem
}
