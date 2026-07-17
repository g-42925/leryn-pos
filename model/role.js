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
      type: [Schema.Types.ObjectId],
      required: true,
      default: [],
    }
  },
  { timestamps: true }
);

const role = models.Role || model(
  "Role",
  RoleSchema
);


export {
  role
}
