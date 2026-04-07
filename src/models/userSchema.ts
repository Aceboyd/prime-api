
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  country: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  total_balance: { type: Number, default: 0 },
  total_deposit: { type: Number, default: 0 },
  total_profit: { type: Number, default: 0 },
  bonus: { type: Number, default: 0 },
  total_withdrawal: { type: Number, default: 0 },
  kyc_status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  selected_trader: { type: String, default: null },
});

export default mongoose.model('User', userSchema);
