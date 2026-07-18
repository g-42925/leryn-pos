import mongoose from 'mongoose';

const outletSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  name: {
    type: String,
    required: true
  }
});


export default mongoose.model(
  'Outlet',
  outletSchema
);
