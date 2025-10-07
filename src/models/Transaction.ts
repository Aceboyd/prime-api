import { Schema, model, Document, Model } from "mongoose";

export interface TransactionDocument extends Document {
  user: Schema.Types.ObjectId;
  type: "deposit" | "withdraw" | "trade";
  asset: string;
  amount: number;
  value: number;
  fee: number;
  status: "pending" | "completed" | "failed";
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<TransactionDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["deposit", "withdraw", "trade"], required: true },
    asset: { type: String, required: true },
    amount: { type: Number, required: true },
    value: { type: Number, required: true },
    fee: { type: Number, default: 0 },
    status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const TransactionModel: Model<TransactionDocument> = model<TransactionDocument>("Transaction", transactionSchema);

export default TransactionModel;