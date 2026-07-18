import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
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
  }
});

const admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);


export { admin }

