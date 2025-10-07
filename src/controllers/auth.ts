import { Request, Response } from "express";
import UserModel, { UserDocument } from "../models/user";
import jwt, { SignOptions } from "jsonwebtoken";
import { CustomRequest } from "../middleware/authMiddleware";

// 🛠️ Environment variable for JWT secret
const JWT_SECRET: string = process.env.JWT_SECRET || "mysecretkey123";

// 🛠️ Default token expiration
const JWT_EXPIRES_IN: string | number = process.env.JWT_EXPIRES_IN || "1d";

// 📝 Register a new user
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, email, password, confirmPassword, country, phone, role } = req.body;

    // Validate confirmPassword
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already in use" });
    }

    // Create new user (password hashing handled by schema pre-save hook)
    const user = new UserModel({
      first_name,
      last_name,
      email,
      password,
      country,
      phone,
      role: role || "user", // Default to 'user' if role not provided
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { id: String(user._id), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as SignOptions
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        country: user.country,
        phone: user.phone,
        role: user.role,
        total_balance: user.total_balance,
        total_deposit: user.total_deposit,
        total_profit: user.total_profit,
        kyc_status: user.kyc_status,
        selected_trader: user.selected_trader,
      },
      token,
    });
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🔐 Login user
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: String(user._id), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as SignOptions
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        country: user.country,
        phone: user.phone,
        role: user.role,
        total_balance: user.total_balance,
        total_deposit: user.total_deposit,
        total_profit: user.total_profit,
        kyc_status: user.kyc_status,
        selected_trader: user.selected_trader,
      },
      token,
    });
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 👤 Get user profile (authenticated user)
export const getUserProfile = async (req: CustomRequest, res: Response) => {
  try {
    const user = await UserModel.findById(req.user?.id).select("-password").populate("selected_trader", "name");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        country: user.country,
        phone: user.phone,
        role: user.role,
        total_balance: user.total_balance,
        total_deposit: user.total_deposit,
        total_profit: user.total_profit,
        kyc_status: user.kyc_status,
        selected_trader: user.selected_trader,
      },
    });
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 📋 Get all users (admin only)
export const getAllUsers = async (req: CustomRequest, res: Response) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. Admin only." });
    }

    const users = await UserModel.find().select("-password").populate("selected_trader", "name");
    res.status(200).json({
      success: true,
      data: users.map((user) => ({
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        country: user.country,
        phone: user.phone,
        role: user.role,
        total_balance: user.total_balance,
        total_deposit: user.total_deposit,
        total_profit: user.total_profit,
        kyc_status: user.kyc_status,
        selected_trader: user.selected_trader,
      })),
    });
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 👤 Get single user by ID (admin or self)
export const getSingleUser = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (req.user?.role !== "admin" && req.user?.id !== id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const user = await UserModel.findById(id).select("-password").populate("selected_trader", "name");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        country: user.country,
        phone: user.phone,
        role: user.role,
        total_balance: user.total_balance,
        total_deposit: user.total_deposit,
        total_profit: user.total_profit,
        kyc_status: user.kyc_status,
        selected_trader: user.selected_trader,
      },
    });
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✏️ Update user data
export const updateUser = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, country, phone, password, confirmPassword } = req.body;

    if (password && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    if (req.user?.role !== "admin" && req.user?.id !== id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const updateData: Partial<UserDocument> = {
      first_name,
      last_name,
      email,
      country,
      phone,
    };

    if (password) {
      updateData.password = password;
    }

    const user = await UserModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password").populate("selected_trader", "name");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        country: user.country,
        phone: user.phone,
        role: user.role,
        total_balance: user.total_balance,
        total_deposit: user.total_deposit,
        total_profit: user.total_profit,
        kyc_status: user.kyc_status,
        selected_trader: user.selected_trader,
      },
    });
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🗑️ Delete user
export const deleteUser = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (req.user?.role !== "admin" && req.user?.id !== id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const user = await UserModel.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};