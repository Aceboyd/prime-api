"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        // Check if MONGO_URI is defined
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined in the .env file");
        }
        // Connect to MongoDB (no options needed for modern Mongoose)
        const conn = await mongoose_1.default.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch (err) {
        console.error("Failed to connect to MongoDB:", err.message);
        process.exit(1);
    }
};
exports.default = connectDB;
//# sourceMappingURL=index.js.map