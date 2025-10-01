"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUserData = exports.loginUser = exports.createUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../models/user"));
// ---------------- SIGNUP ----------------
const createUser = async (req, res) => {
    try {
        const { first_name, last_name, email, password, confirmPassword, country, phone, role, } = req.body;
        if (!first_name ||
            !last_name ||
            !email ||
            !password ||
            !confirmPassword ||
            !country ||
            !phone) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }
        const emailLower = email.toLowerCase();
        const existingUser = await user_1.default.findOne({ email: emailLower });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }
        const user = new user_1.default({
            first_name,
            last_name,
            email: emailLower,
            password,
            country,
            phone,
            role: role || "user",
        });
        await user.save();
        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                country: user.country,
                phone: user.phone,
                role: user.role,
            },
        });
    }
    catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Email already registered" });
        }
        console.error("Signup error:", error.message);
        res.status(500).json({ message: "Server error: " + error.message });
    }
};
exports.createUser = createUser;
// ---------------- LOGIN ----------------
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const emailLower = email.toLowerCase();
        const user = await user_1.default.findOne({ email: emailLower });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined in .env file");
        }
        const secret = process.env.JWT_SECRET;
        const expiresIn = process.env.JWT_EXPIRES_IN ?? "1d";
        const validExpiresInValues = ["1h", "1d", "7d", "30d"];
        let expiresInValue;
        if (validExpiresInValues.includes(expiresIn)) {
            expiresInValue = expiresIn;
        }
        else if (!isNaN(Number(expiresIn))) {
            expiresInValue = Number(expiresIn);
        }
        else {
            throw new Error("JWT_EXPIRES_IN must be a number or one of: " + validExpiresInValues.join(", "));
        }
        const options = { expiresIn: expiresInValue };
        const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email, role: user.role }, secret, options);
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ message: "Server error: " + error.message });
    }
};
exports.loginUser = loginUser;
// ---------------- GET USER DATA ----------------
const getUserData = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await user_1.default.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ user });
    }
    catch (error) {
        console.error("Get user data error:", error.message);
        res.status(500).json({ message: "Server error: " + error.message });
    }
};
exports.getUserData = getUserData;
// ---------------- UPDATE USER ----------------
// ---------------- UPDATE USER ----------------
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (req.user?.id !== id) {
            return res.status(403).json({ message: "Forbidden: You can only update your own account" });
        }
        const updateData = req.body;
        if (updateData.password)
            delete updateData.password;
        const updatedUser = await user_1.default.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        }).select("-password");
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({
            message: "User updated successfully",
            user: updatedUser,
        });
    }
    catch (error) {
        console.error("Update user error:", error.message);
        res.status(500).json({ message: "Server error: " + error.message });
    }
};
exports.updateUser = updateUser;
// ---------------- DELETE USER ----------------
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (req.user?.id !== id) {
            return res.status(403).json({ message: "Forbidden: You can only delete your own account" });
        }
        const deletedUser = await user_1.default.findByIdAndDelete(id).select("-password");
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({
            message: "User deleted successfully",
            user: deletedUser,
        });
    }
    catch (error) {
        console.error("Delete user error:", error.message);
        res.status(500).json({ message: "Server error: " + error.message });
    }
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=auth.js.map