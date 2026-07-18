import { Schema, model, models } from "mongoose";

const RoleSchema = new Schema(
  {
    accountId: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
    },
    permissions: {
      type: [String],
      required: true,
      default: [],
    }
  },
  { timestamps: true }
);

export default models.Role || model("Role", RoleSchema);
