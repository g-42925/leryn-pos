import { Schema, model, models } from "mongoose";

const AdditionalMenuSchema = new Schema(
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
    menuId: {
      type: Schema.Types.ObjectId,
      ref: 'Menu',
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
    }
  },
  {
    timestamps: true,
  }
);

AdditionalMenuSchema.index({ accountId: 1, branchId: 1, menuId: 1, name: 1 }, { unique: true });

export default models.AdditionalMenu || model("AdditionalMenu", AdditionalMenuSchema);
