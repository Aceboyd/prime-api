import { Router, Request, Response } from "express";
import {
  registerUser,
  loginUser,
  loginAdmin, // ✅ Added
  getUserProfile,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
} from "../controllers/auth";
import { authMiddleware } from "../middleware/authMiddleware";
import WalletAddress from "../models/WalletAddress";
import Transaction from "../models/Transaction";

const router = Router();

/* =====================================================
   🔐 AUTH ROUTES
===================================================== */

// 📝 Register a new user
router.post("/register", registerUser);

// 🔑 User login
router.post("/login", loginUser);

// 🔑 Admin login (new)
 /**
 * @swagger
 * /auth/admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: AdminSecure123!
 *     responses:
 *       200:
 *         description: Admin logged in successfully
 *       401:
 *         description: Invalid credentials or not an admin
 */
router.post("/admin/login", loginAdmin);

// 👤 Get authenticated user profile
router.get("/profile", authMiddleware, getUserProfile);

// 📋 Get all users (admin only)
router.get("/", authMiddleware, getAllUsers);

// 👤 Get a single user by ID
router.get("/:id", authMiddleware, getSingleUser);

// ✏️ Update user
router.put("/:id", authMiddleware, updateUser);

// 🗑️ Delete user
router.delete("/:id", authMiddleware, deleteUser);

/* =====================================================
   💰 WALLET & TRANSACTION ROUTES
===================================================== */

// 💰 Get wallet addresses
router.get("/wallet-addresses", authMiddleware, async (req: Request, res: Response) => {
  try {
    const addresses = await WalletAddress.find().select("currency network address");
    res.json({ success: true, data: addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 💸 Create deposit
router.post("/deposit", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { currency, amount } = req.body;
    if (!["BTC", "ETH", "USDT"].includes(currency) || !amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid currency or amount" });
    }

    const walletAddress = await WalletAddress.findOne({ currency });
    if (!walletAddress) {
      return res.status(400).json({ success: false, message: `No deposit address found for ${currency}` });
    }

    const transaction = new Transaction({
      user: req.user!.id,
      type: "deposit",
      asset: currency,
      amount,
      value: amount,
      fee: 0,
      status: "pending",
    });
    await transaction.save();

    res.json({
      success: true,
      data: {
        transaction: {
          id: transaction._id,
          user: transaction.user,
          type: transaction.type,
          asset: transaction.asset,
          amount: transaction.amount,
          value: transaction.value,
          fee: transaction.fee,
          status: transaction.status,
          date: transaction.date,
        },
        depositAddress: walletAddress.address,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 📜 Get user transactions
router.get("/transactions", authMiddleware, async (req: Request, res: Response) => {
  try {
    const transactions = await Transaction.find({ user: req.user!.id });
    res.json({
      success: true,
      data: transactions.map((t) => ({
        id: t._id,
        user: t.user,
        type: t.type,
        asset: t.asset,
        amount: t.amount,
        value: t.value,
        fee: t.fee,
        status: t.status,
        date: t.date,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
