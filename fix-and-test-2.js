import mongoose from 'mongoose';
import { connectToDatabase } from './lib/mongodb.js'

const BranchSchema = new mongoose.Schema({ accountId: String, name: String });
const Branch = mongoose.models.Branch || mongoose.model("Branch", BranchSchema);

const AccountSchema = new mongoose.Schema({ email: String });
const Account = mongoose.models.Account || mongoose.model("Account", AccountSchema);

async function run() {
  await connectToDatabase();
  const accounts = await Account.find({}).lean()
  console.log("Accounts:", accounts.map(a => a._id.toString()))
  const branches = await Branch.find({}).lean()
  console.log("Branches:", branches)
  process.exit(0)
}
run().catch(console.dir)
