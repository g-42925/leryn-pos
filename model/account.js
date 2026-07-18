import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

const account = mongoose.models.Account || mongoose.model('Account', accountSchema);

export {
  account
}