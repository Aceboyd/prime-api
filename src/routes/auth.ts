import { Router } from "express";
import { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  getAllUsers, 
  getSingleUser, 
  updateUser, 
  deleteUser 
} from "../controllers/auth";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// 📝 User registration (public)
router.post("/register", registerUser);

// 🔐 User login (public)
router.post("/login", loginUser);

// 👤 Get authenticated user profile (protected)
router.get("/profile", authMiddleware, getUserProfile);

// 📋 Get all users (admin only, protected)
router.get("/", authMiddleware, getAllUsers);

// 👤 Get single user by ID (admin or self, protected)
router.get("/:id", authMiddleware, getSingleUser);

// ✏️ Update user data (admin or self, protected)
router.put("/:id", authMiddleware, updateUser);

// 🗑️ Delete user (admin or self, protected)
router.delete("/:id", authMiddleware, deleteUser);

export default router;