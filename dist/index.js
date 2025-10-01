"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const index_1 = __importDefault(require("./db/index"));
const auth_1 = __importDefault(require("./routes/auth"));
const cors_1 = __importDefault(require("cors")); // Add this import
dotenv_1.default.config();
(0, index_1.default)();
const app = (0, express_1.default)();
app.use((0, cors_1.default)()); // Add this to allow frontend requests
app.use(express_1.default.json());
app.use("/auth", auth_1.default);
app.get("/", (req, res) => {
    res.json({ ok: true, message: "API running 🚀" });
});
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
//# sourceMappingURL=index.js.map