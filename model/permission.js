import { Schema, model, models } from "mongoose";

const PermissionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const permission = models.Permission || model(
  "Permission",
  PermissionSchema
);

export {
  permission
}
