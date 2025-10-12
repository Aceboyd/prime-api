import { Schema, model, Document, Model } from "mongoose";

export interface TraderDocument extends Document {
  name: string;
  description: string;
  performance: number;
  numberOfTrades: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const traderSchema = new Schema<TraderDocument>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    performance: { type: Number, default: 0, min: [0, "Performance cannot be negative"] },
    numberOfTrades: { type: Number, default: 0, min: [0, "Number of trades cannot be negative"] },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const TraderModel: Model<TraderDocument> = model<TraderDocument>("Trader", traderSchema);

export default TraderModel;