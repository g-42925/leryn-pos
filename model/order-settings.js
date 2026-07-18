import { Schema, model, models } from "mongoose";

const ServiceChargeSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    percentage: { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

const OrderSettingsSchema = new Schema(
  {
    accountId: { type: String, required: true, trim: true },
    branchId: { type: String, required: true, trim: true },
    takeAway: {
      enabled: { type: Boolean, default: true },
      serviceCharges: { type: [ServiceChargeSchema], default: [] },
    },
    dineIn: {
      enabled: { type: Boolean, default: true },
      serviceCharges: { type: [ServiceChargeSchema], default: [] },
    },
  },
  { timestamps: true }
);

OrderSettingsSchema.index({ accountId: 1, branchId: 1 }, { unique: true });

export default models.OrderSettings || model("OrderSettings", OrderSettingsSchema);
