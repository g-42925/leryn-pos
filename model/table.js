import { Schema, model, models } from "mongoose";

const TableSchema = new Schema(
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
    tableAreaId: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      default: 2,
    },
    status: {
      type: String,
      enum: ["available", "occupied"],
      default: "available",
      required: true,
    },
    x: {
      type: Number,
      required: true,
      default: 0,
    },
    y: {
      type: Number,
      required: true,
      default: 0,
    }
  },
  { timestamps: true }
);

TableSchema.index({ accountId: 1, branchId: 1, tableAreaId: 1 });

export default models.Table || model("Table", TableSchema);
