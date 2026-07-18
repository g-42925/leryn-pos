import { Schema, model, models } from "mongoose";

const StaffSchema = new Schema(
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
    phoneNumber: {
      type: String,
      default: "",
    },
    pin: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "cashier",
    }
  },
  { timestamps: true }
);

export default models.Staff || model("Staff", StaffSchema);
