import { Schema, model, models } from "mongoose";

const OrderItemSchema = new Schema(
  {
    menuId: {
      type: String,
      required: true,
    },
    menuName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
      default: "",
    },
    additionals: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
      },
    ],
  },
  { _id: true }
);

const OrderSchema = new Schema(
  {
    accountId: {
      type: String,
      required: true,
      trim: true,
    },
    branchId: {
      type: String,
      required: true,
      trim: true,
    },
    staffId: {
      type: String,
      required: true,
      trim: true,
    },
    tableId: {
      type: String,
      default: "",
    },
    tableAreaId: {
      type: String,
      default: "",
    },
    tableName: {
      type: String,
      default: "",
    },
    orderType: {
      type: String,
      enum: ["dine-in", "take-away"],
      default: "dine-in",
    },
    status: {
      type: String,
      enum: ["draft", "active", "completed"],
      default: "draft",
      required: true,
    },
    items: {
      type: [OrderItemSchema],
      default: [],
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

OrderSchema.index({ accountId: 1, branchId: 1, status: 1 });
OrderSchema.index({ accountId: 1, branchId: 1, tableId: 1, status: 1 });

export default models.Order || model("Order", OrderSchema);
