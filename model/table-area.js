import { Schema, model, models } from "mongoose";

const TableAreaSchema = new Schema(
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
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

TableAreaSchema.index({ accountId: 1, branchId: 1 });

export default models.TableArea || model("TableArea", TableAreaSchema);
