import { Schema, model, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface UserDocument extends Document {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  country: string;
  phone: string;
  role: "user" | "admin";
  total_balance: number;
  total_deposit: number;
  total_profit: number;
  kyc_status: "pending" | "approved" | "rejected";
  selected_trader: Schema.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<UserDocument>(
  {
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    country: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    total_balance: { type: Number, default: 0 },
    total_deposit: { type: Number, default: 0 },
    total_profit: { type: Number, default: 0 },
    kyc_status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    selected_trader: { type: Schema.Types.ObjectId, ref: "Trader", default: null },
  },
  { timestamps: true }
);

// 🔒 Hash password before save
userSchema.pre("save", async function (next) {
  const user = this as UserDocument;
  if (!user.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  next();
});

// 🔑 Compare passwords
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const UserModel: Model<UserDocument> = model<UserDocument>("User", userSchema);

export default UserModel;