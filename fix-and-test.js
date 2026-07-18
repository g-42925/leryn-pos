import { connectToDatabase } from './lib/mongodb.js'
import Branch from './model/branch.js'
import Account from './model/account.js'
async function run() {
  await connectToDatabase();
  console.log("Connected")
  const accounts = await Account.find({}).lean()
  console.log("Accounts:", accounts.map(a => a._id.toString()))
  const branches = await Branch.find({}).lean()
  console.log("Branches:", branches)
  process.exit(0)
}
run().catch(console.dir)
