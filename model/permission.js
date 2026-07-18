import { Schema, model, models } from "mongoose";

const PermissionSchema = new Schema(
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
    description: {
      type: String,
      default: "",
    }
  },
  { timestamps: true }
);

export default models.Permission || model("Permission", PermissionSchema);
