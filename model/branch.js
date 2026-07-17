import { Schema, model, models } from "mongoose";

const BranchSchema = new Schema(
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
    address: {
      type: String,
      default: "",
    },
    inventoryId: {
      type: String,
      required: true,
    }
  }
);

BranchSchema.index(
  {
    accountId: 1,
    name: 1,
  },
  {
    unique: true,
  }
);

const branch = models.Branch || model("Branch", BranchSchema);

export {
  branch
}