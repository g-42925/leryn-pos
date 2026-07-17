import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  accountId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: true
  }
});


const admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);


export { admin }

