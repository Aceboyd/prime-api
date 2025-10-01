import { Request, Response } from "express";
import UserModel, { UserDocument } from "../models/user";
import jwt from "jsonwebtoken";
import { CustomRequest } from "../middleware/authMiddleware";

//  Environment variable for JWT secret
const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET || "mysecretkey123";

//  Register a new user
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, email, password, confirmPassword, country, phone, role } = req.body;

    // Validate confirmPassword
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Create new user (password hashing handled by schema pre-save hook)
    const user = new UserModel({
      first_name,
      last_name,
      email,
      password,
      country,
      phone,
      role,
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: (error as Error).message });
  }
};

//  Login user
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: (error as Error).message });
  }
};

//  Get user profile (authenticated user)
export const getUserProfile = async (req: CustomRequest, res: Response) => {
  try {
    const user = await UserModel.findById(req.user?.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: (error as Error).message });
  }
};

//  Get all users (admin only)
export const getAllUsers = async (req: CustomRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const users = await UserModel.find().select("-password");
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: (error as Error).message });
  }
};

//  Get single user by ID (admin or self)
export const getSingleUser = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if user is admin or requesting their own data
    if (req.user?.role !== "admin" && req.user?.id !== id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await UserModel.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: (error as Error).message });
  }
};

//  Update user data
export const updateUser = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, country, phone, password, confirmPassword } = req.body;

    // Validate confirmPassword if password is provided
    if (password && password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check if user is admin or updating their own data
    if (req.user?.role !== "admin" && req.user?.id !== id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updateData: Partial<UserDocument> = {
      first_name,
      last_name,
      email,
      country,
      phone,
    };

    // Only include password if provided (hashing handled by schema pre-save hook)
    if (password) {
      updateData.password = password;
    }

    const user = await UserModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: (error as Error).message });
  }
};

//  Delete user
export const deleteUser = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if user is admin or deleting their own account
    if (req.user?.role !== "admin" && req.user?.id !== id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await UserModel.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: (error as Error).message });
  }
};