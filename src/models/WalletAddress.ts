import { Schema, model, Document, Model } from "mongoose";

export interface WalletAddressDocument extends Document {
  currency: "BTC" | "ETH" | "USDT";
  network: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

const walletAddressSchema = new Schema<WalletAddressDocument>(
  {
    currency: { type: String, enum: ["BTC", "ETH", "USDT"], required: true, unique: true },
    network: { type: String, required: true, trim: true }, // e.g., "Bitcoin", "Ethereum", "TRC20"
    address: { type: String, required: true, trim: true, unique: true },
  },
  { timestamps: true }
);

const WalletAddressModel: Model<WalletAddressDocument> = model<WalletAddressDocument>("WalletAddress", walletAddressSchema);

export default WalletAddressModel;