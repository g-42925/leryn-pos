import { Schema, model, models } from "mongoose";

const TaxSchema = new Schema(
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
    percentage: {
      type: Number,
      required: true,
      min: 0,
    }
  },
  {
    timestamps: true,
  }
);

TaxSchema.index({ accountId: 1, name: 1 }, { unique: true });

export default models.Tax || model("Tax", TaxSchema);
