import { Schema, model, models } from "mongoose";

const CustomerSchema = new Schema(
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
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    }
  },
  {
    timestamps: true,
  }
);

CustomerSchema.index({ accountId: 1, email: 1 }, { unique: true });

export default models.Customer || model("Customer", CustomerSchema);
