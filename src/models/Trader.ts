import { Schema, model, Document, Model } from "mongoose";

export interface TraderDocument extends Document {
  name: string;
  description: string;
  performance: number;
  numberOfTrades: number;
  followers: number;
  risk: "Low" | "Medium" | "High";
  roi: number;
  win_rate: number;
  trades: number;
  min_invest: number;
  max_invest: number;
  duration: string;
  slots: number;
  image_url: string;
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
    followers: { type: Number, default: 0, min: [0, "Followers cannot be negative"] },
    risk: { type: String, enum: ["Low", "Medium", "High"], default: "Low" },
    roi: { type: Number, default: 0, min: [0, "ROI cannot be negative"] },
    win_rate: { type: Number, default: 0, min: [0, "Win rate cannot be negative"] },
    trades: { type: Number, default: 0, min: [0, "Trades cannot be negative"] },
    min_invest: { type: Number, default: 0, min: [0, "Min invest cannot be negative"] },
    max_invest: { type: Number, default: 0, min: [0, "Max invest cannot be negative"] },
    duration: { type: String, default: "1 Day" },
    slots: { type: Number, default: 0, min: [0, "Slots cannot be negative"] },
    image_url: { type: String, default: "" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const TraderModel: Model<TraderDocument> = model<TraderDocument>("Trader", traderSchema);

export default TraderModel;
