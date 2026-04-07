import { Router, Request, Response, NextFunction } from "express";
import User from "../models/user";
import Transaction from "../models/Transaction";
import Trader from "../models/Trader";
import WalletAddress from "../models/WalletAddress";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// Admin middleware
interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string; role: string };
}

const adminMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.id).select("role email");
    if (!user || user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }
    next();
  } catch (error: any) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// 📋 Get all users (admin only)
/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users with their details, excluding passwords. Admin access required.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "507f1f77bcf86cd799439011"
 *                       first_name:
 *                         type: string
 *                         example: "John"
 *                       last_name:
 *                         type: string
 *                         example: "Doe"
 *                       email:
 *                         type: string
 *                         example: "john.doe@example.com"
 *                       country:
 *                         type: string
 *                         nullable: true
 *                         example: "USA"
 *                       phone:
 *                         type: string
 *                         nullable: true
 *                         example: "+1234567890"
 *                       total_balance:
 *                         type: number
 *                         example: 1000.50
 *                       total_deposit:
 *                         type: number
 *                         example: 500.00
 *                       total_profit:
 *                         type: number
 *                         example: 200.00
 *                       kyc_status:
 *                         type: string
 *                         enum: [pending, approved, rejected]
 *                         example: "pending"
 *                       selected_trader:
 *                         type: string
 *                         nullable: true
 *                         example: "507f1f77bcf86cd799439012"
 *       403:
 *         description: Forbidden (not admin)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Admin access required"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid token"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */
router.get("/users", authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await User.find().select("-password");
    res.json({
      success: true,
      data: users.map(user => ({
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        country: user.country,
        phone: user.phone,
        total_balance: user.total_balance || 0,
        total_deposit: user.total_deposit || 0,
        total_profit: user.total_profit || 0,
        bonus: user.bonus || 0,
        total_withdrawal: user.total_withdrawal || 0,
        kyc_status: user.kyc_status || 'pending',
        selected_trader: user.selected_trader || null
      }))
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🗑️ Delete a user (admin only)
/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Delete a user by ID and all associated transactions. Admin access required.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User deleted successfully"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       403:
 *         description: Forbidden (not admin)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Admin access required"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid token"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */
router.delete("/users/:id", authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    await Transaction.deleteMany({ user: req.params.id });
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✏️ Update user details (admin only)
/**
 * @swagger
 * /admin/users/{id}:
 *   put:
 *     summary: Update user details
 *     description: Update specific user details by ID. Admin access required.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               total_balance:
 *                 type: number
 *                 example: 1000.50
 *               total_deposit:
 *                 type: number
 *                 example: 500.00
 *               total_profit:
 *                 type: number
 *                 example: 200.00
 *               kyc_status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *                 example: "approved"
 *               selected_trader:
 *                 type: string
 *                 nullable: true
 *                 example: "507f1f77bcf86cd799439012"
 *             required: [total_balance, total_deposit, total_profit, kyc_status]
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     first_name:
 *                       type: string
 *                       example: "John"
 *                     last_name:
 *                       type: string
 *                       example: "Doe"
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *                     country:
 *                       type: string
 *                       nullable: true
 *                       example: "USA"
 *                     phone:
 *                       type: string
 *                       nullable: true
 *                       example: "+1234567890"
 *                     total_balance:
 *                       type: number
 *                       example: 1000.50
 *                     total_deposit:
 *                       type: number
 *                       example: 500.00
 *                     total_profit:
 *                       type: number
 *                       example: 200.00
 *                     kyc_status:
 *                       type: string
 *                       example: "approved"
 *                     selected_trader:
 *                       type: string
 *                       nullable: true
 *                       example: "507f1f77bcf86cd799439012"
 *       400:
 *         description: Invalid trader ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid or inactive trader"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       403:
 *         description: Forbidden (not admin)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Admin access required"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid token"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */
router.put("/users/:id", authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { total_balance, total_deposit, total_profit, bonus, total_withdrawal, kyc_status, selected_trader } = req.body;
    if (selected_trader) {
      const trader = await Trader.findById(selected_trader);
      if (!trader || !trader.active) {
        return res.status(400).json({ success: false, message: "Invalid or inactive trader" });
      }
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { total_balance, total_deposit, total_profit, bonus, total_withdrawal, kyc_status, selected_trader },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 💰 Create transaction (admin only)
/**
 * @swagger
 * /admin/transactions:
 *   post:
 *     summary: Create a transaction
 *     description: Create a new transaction for a user. Updates user balance for completed deposits or withdrawals. Admin access required.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               type:
 *                 type: string
 *                 enum: [deposit, withdraw, trade]
 *                 example: "deposit"
 *               asset:
 *                 type: string
 *                 enum: [BTC, ETH, USDT]
 *                 example: "BTC"
 *               amount:
 *                 type: number
 *                 example: 0.5
 *               value:
 *                 type: number
 *                 example: 30000
 *               fee:
 *                 type: number
 *                 example: 10
 *               status:
 *                 type: string
 *                 enum: [pending, completed, failed]
 *                 example: "completed"
 *             required: [userId, type, asset, amount, value, fee, status]
 *     responses:
 *       200:
 *         description: Transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439013"
 *                     user:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     type:
 *                       type: string
 *                       example: "deposit"
 *                     asset:
 *                       type: string
 *                       example: "BTC"
 *                     amount:
 *                       type: number
 *                       example: 0.5
 *                     value:
 *                       type: number
 *                       example: 30000
 *                     fee:
 *                       type: number
 *                       example: 10
 *                     status:
 *                       type: string
 *                       example: "completed"
 *                     date:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-10-08T07:38:00.000Z"
 *       400:
 *         description: Invalid request (e.g., invalid type or asset)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid type or asset"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       403:
 *         description: Forbidden (not admin)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Admin access required"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid token"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */
router.post("/transactions", authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, type, asset, amount, value, fee, status } = req.body;
    if (!["deposit", "withdraw", "trade"].includes(type) || !["BTC", "ETH", "USDT"].includes(asset)) {
      return res.status(400).json({ success: false, message: "Invalid type or asset" });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const transaction = new Transaction({ user: userId, type, asset, amount, value, fee, status });
    await transaction.save();

    if (type === "deposit" && status === "completed") {
      await User.findByIdAndUpdate(userId, { $inc: { total_deposit: amount, total_balance: amount } });
    } else if (type === "withdraw" && status === "completed") {
      if (user.total_balance < amount) {
        return res.status(400).json({ success: false, message: "Insufficient balance" });
      }
      await User.findByIdAndUpdate(userId, { $inc: { total_balance: -amount } });
    }

    res.json({
      success: true,
      data: {
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
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 📜 Get transactions for a user (admin only)
/**
 * @swagger
 * /admin/users/{id}/transactions:
 *   get:
 *     summary: Get transactions for a user
 *     description: Retrieve all transactions for a specific user, including user details (first_name, last_name). Admin access required.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: List of transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "507f1f77bcf86cd799439013"
 *                       user:
 *                         type: object
 *                         properties:
 *                           first_name:
 *                             type: string
 *                             example: "John"
 *                           last_name:
 *                             type: string
 *                             example: "Doe"
 *                       type:
 *                         type: string
 *                         example: "deposit"
 *                       asset:
 *                         type: string
 *                         example: "BTC"
 *                       amount:
 *                         type: number
 *                         example: 0.5
 *                       value:
 *                         type: number
 *                         example: 30000
 *                       fee:
 *                         type: number
 *                         example: 10
 *                       status:
 *                         type: string
 *                         example: "completed"
 *                       date:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-08T07:38:00.000Z"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       403:
 *         description: Forbidden (not admin)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Admin access required"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid token"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */
router.get("/users/:id/transactions", authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const transactions = await Transaction.find({ user: req.params.id }).populate("user", "first_name last_name");
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✏️ Update transaction (admin only)
/**
 * @swagger
 * /admin/users/{id}/transactions/{transactionId}:
 *   put:
 *     summary: Update a transaction
 *     description: Update an existing transaction for a user, reverting and reapplying balance updates as needed. Admin access required.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The transaction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [deposit, withdraw, trade]
 *                 example: "deposit"
 *               asset:
 *                 type: string
 *                 enum: [BTC, ETH, USDT]
 *                 example: "BTC"
 *               amount:
 *                 type: number
 *                 example: 0.5
 *               value:
 *                 type: number
 *                 example: 30000
 *               fee:
 *                 type: number
 *                 example: 10
 *               status:
 *                 type: string
 *                 enum: [pending, completed, failed]
 *                 example: "completed"
 *             required: [type, asset, amount, value, fee, status]
 *     responses:
 *       200:
 *         description: Transaction updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439013"
 *                     user:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     type:
 *                       type: string
 *                       example: "deposit"
 *                     asset:
 *                       type: string
 *                       example: "BTC"
 *                     amount:
 *                       type: number
 *                       example: 0.5
 *                     value:
 *                       type: number
 *                       example: 30000
 *                     fee:
 *                       type: number
 *                       example: 10
 *                     status:
 *                       type: string
 *                       example: "completed"
 *                     date:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-10-08T07:38:00.000Z"
 *       400:
 *         description: Invalid request (e.g., invalid type or asset, insufficient balance)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid type or asset"
 *       404:
 *         description: User or transaction not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Transaction not found"
 *       403:
 *         description: Forbidden (not admin)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Admin access required"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid token"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */
router.put("/users/:id/transactions/:transactionId", authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { type, asset, amount, value, fee, status } = req.body;
    if (!["deposit", "withdraw", "trade"].includes(type) || !["BTC", "ETH", "USDT"].includes(asset)) {
      return res.status(400).json({ success: false, message: "Invalid type or asset" });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const transaction = await Transaction.findById(req.params.transactionId);
    if (!transaction) return res.status(404).json({ success: false, message: "Transaction not found" });

    if (transaction.type === "deposit" && transaction.status === "completed") {
      await User.findByIdAndUpdate(req.params.id, { $inc: { total_deposit: -transaction.amount, total_balance: -transaction.amount } });
    } else if (transaction.type === "withdraw" && transaction.status === "completed") {
      await User.findByIdAndUpdate(req.params.id, { $inc: { total_balance: transaction.amount } });
    }

    transaction.type = type;
    transaction.asset = asset;
    transaction.amount = amount;
    transaction.value = value;
    transaction.fee = fee;
    transaction.status = status;
    await transaction.save();

    if (type === "deposit" && status === "completed") {
      await User.findByIdAndUpdate(req.params.id, { $inc: { total_deposit: amount, total_balance: amount } });
    } else if (type === "withdraw" && status === "completed") {
      if (user.total_balance < amount) {
        return res.status(400).json({ success: false, message: "Insufficient balance" });
      }
      await User.findByIdAndUpdate(req.params.id, { $inc: { total_balance: -amount } });
    }

    res.json({
      success: true,
      data: {
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
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🗑️ Delete transaction (admin only)
/**
 * @swagger
 * /admin/users/{id}/transactions/{transactionId}:
 *   delete:
 *     summary: Delete a transaction
 *     description: Delete a specific transaction for a user, reverting balance updates if applicable. Admin access required.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The transaction ID
 *     responses:
 *       200:
 *         description: Transaction deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Transaction deleted successfully"
 *       404:
 *         description: User or transaction not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Transaction not found"
 *       403:
 *         description: Forbidden (not admin)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Admin access required"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid token"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */
router.delete("/users/:id/transactions/:transactionId", authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const transaction = await Transaction.findById(req.params.transactionId);
    if (!transaction) return res.status(404).json({ success: false, message: "Transaction not found" });

    if (transaction.type === "deposit" && transaction.status === "completed") {
      await User.findByIdAndUpdate(req.params.id, { $inc: { total_deposit: -transaction.amount, total_balance: -transaction.amount } });
    } else if (transaction.type === "withdraw" && transaction.status === "completed") {
      await User.findByIdAndUpdate(req.params.id, { $inc: { total_balance: transaction.amount } });
    }

    await Transaction.findByIdAndDelete(req.params.transactionId);
    res.json({ success: true, message: "Transaction deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🤝 Create trader (admin only)
/**
 * @swagger
 * /admin/traders:
 *   post:
 *     summary: Create a trader
 *     description: Create a new trader with specified details. Admin access required.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Trader One"
 *               description:
 *                 type: string
 *                 example: "Experienced crypto trader"
 *               performance:
 *                 type: number
 *                 example: 0.85
 *               numberOfTrades:
 *                 type: number
 *                 example: 100
 *               active:
 *                 type: boolean
 *                 example: true
 *             required: [name]
 *     responses:
 *       200:
 *         description: Trader created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439012"
 *                     name:
 *                       type: string
 *                       example: "Trader One"
 *                     description:
 *                       type: string
 *                       example: "Experienced crypto trader"
 *                     performance:
 *                       type: number
 *                       example: 0.85
 *                     numberOfTrades:
 *                       type: number
 *                       example: 100
 *                     active:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-10-08T07:38:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-10-08T07:38:00.000Z"
 *       400:
 *         description: Invalid request (e.g., missing name or invalid performance)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Name is required"
 *       403:
 *         description: Forbidden (not admin)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Admin access required"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid token"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */
router.post("/traders", authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, performance, numberOfTrades, active } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }
    if (performance && (typeof performance !== "number" || performance < 0)) {
      return res.status(400).json({ success: false, message: "Performance must be a non-negative number" });
    }
    if (numberOfTrades && (typeof numberOfTrades !== "number" || numberOfTrades < 0)) {
      return res.status(400).json({ success: false, message: "Number of trades must be a non-negative number" });
    }
    const trader = new Trader({ name, description, performance: performance || 0, numberOfTrades: numberOfTrades || 0, active: active !== undefined ? active : true });
    await trader.save();
    res.json({ success: true, data: trader });
  } catch (error: any) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 📋 Get all traders (admin only)
/**
 * @swagger
 * /admin/traders:
 *   get:
 *     summary: Get all traders
 *     description: Retrieve a list of all traders. Admin access required.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of traders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "507f1f77bcf86cd799439012"
 *                       name:
 *                         type: string
 *                         example: "Trader One"
 *                       description:
 *                         type: string
 *                         example: "Experienced crypto trader"
 *                       performance:
 *                         type: number
 *                         example: 0.85
 *                       numberOfTrades:
 *                         type: number
 *                         example: 100
 *                       active:
 *                         type: boolean
 *                         example: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-08T07:38:00.000Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-08T07:38:00.000Z"
 *       403:
 *         description: Forbidden (not admin)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Admin access required"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid token"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */
router.get("/traders", authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const traders = await Trader.find();
    res.json({ success: true, data: traders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✏️ Update trader (admin only)
/**
 * @swagger
 * /admin/traders/{id}:
 *   put:
 *     summary: Update a trader
 *     description: Update an existing trader's details by ID. Admin access required.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The trader ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Trader One"
 *               description:
 *                 type: string
 *                 example: "Experienced crypto trader"
 *               performance:
 *                 type: number
 *                 example: 0.85
 *               numberOfTrades:
 *                 type: number
 *                 example: 100
 *               active:
 *                 type: boolean
 *                 example: true
 *             required: [name]
 *     responses:
 *       200:
 *         description: Trader updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439012"
 *                     name:
 *                       type: string
 *                       example: "Trader One"
 *                     description:
 *                       type: string
 *                       example: "Experienced crypto trader"
 *                     performance:
 *                       type: number
 *                       example: 0.85
 *                     numberOfTrades:
 *                       type: number
 *                       example: 100
 *                     active:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-10-08T07:38:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-10-08T07:38:00.000Z"
 *       400:
 *         description: Invalid request (e.g., missing name or invalid performance)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Name is required"
 *       404:
 *         description: Trader not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Trader not found"
 *       403:
 *         description: Forbidden (not admin)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Admin access required"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid token"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */
router.put("/traders/:id", authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, performance, numberOfTrades, active } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }
    if (performance && (typeof performance !== "number" || performance < 0)) {
      return res.status(400).json({ success: false, message: "Performance must be a non-negative number" });
    }
    if (numberOfTrades && (typeof numberOfTrades !== "number" || numberOfTrades < 0)) {
      return res.status(400).json({ success: false, message: "Number of trades must be a non-negative number" });
    }
    const trader = await Trader.findByIdAndUpdate(
      req.params.id,
      { name, description, performance, numberOfTrades, active },
      { new: true }
    );
    if (!trader) return res.status(404).json({ success: false, message: "Trader not found" });
    res.json({ success: true, data: trader });
  } catch (error: any) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🗑️ Delete trader (admin only)
/**
 * @swagger
 * /admin/traders/{id}:
 *   delete:
 *     summary: Delete a trader
 *     description: Delete a specific trader by ID and remove their assignment from users. Admin access required.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The trader ID
 *     responses:
 *       200:
 *         description: Trader deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Trader deleted successfully"
 *       404:
 *         description: Trader not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Trader not found"
 *       403:
 *         description: Forbidden (not admin)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Admin access required"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid token"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */
router.delete("/traders/:id", authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const trader = await Trader.findByIdAndDelete(req.params.id);
    if (!trader) return res.status(404).json({ success: false, message: "Trader not found" });
    await User.updateMany({ selected_trader: req.params.id }, { $set: { selected_trader: null } });
    res.json({ success: true, message: "Trader deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🤝 Assign trader to user (admin only)
/**
 * @swagger
 * /admin/users/{id}/assign-trader:
 *   put:
 *     summary: Assign a trader to a user
 *     description: Assign or update a trader for a specific user. Admin access required.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               traderId:
 *                 type: string
 *                 nullable: true
 *                 example: "507f1f77bcf86cd799439012"
 *             required: [traderId]
 *     responses:
 *       200:
 *         description: Trader assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     first_name:
 *                       type: string
 *                       example: "John"
 *                     last_name:
 *                       type: string
 *                       example: "Doe"
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *                     country:
 *                       type: string
 *                       nullable: true
 *                       example: "USA"
 *                     phone:
 *                       type: string
 *                       nullable: true
 *                       example: "+1234567890"
 *                     total_balance:
 *                       type: number
 *                       example: 1000.50
 *                     total_deposit:
 *                       type: number
 *                       example: 500.00
 *                     total_profit:
 *                       type: number
 *                       example: 200.00
 *                     kyc_status:
 *                       type: string
 *                       example: "approved"
 *                     selected_trader:
 *                       type: string
 *                       nullable: true
 *                       example: "507f1f77bcf86cd799439012"
 *       400:
 *         description: Invalid trader ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid or inactive trader"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       403:
 *         description: Forbidden (not admin)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Admin access required"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid token"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */
router.put("/users/:id/assign-trader", authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { traderId } = req.body;
    if (traderId) {
      const trader = await Trader.findById(traderId);
      if (!trader || !trader.active) {
        return res.status(400).json({ success: false, message: "Invalid or inactive trader" });
      }
    }
    const user = await User.findByIdAndUpdate(req.params.id, { selected_trader: traderId }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 📋 Get all traders (user-accessible)
/**
 * @swagger
 * /traders:
 *   get:
 *     summary: Get all active traders
 *     description: Retrieve a list of all active traders. Accessible to authenticated users.
 *     tags: [Traders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active traders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "507f1f77bcf86cd799439012"
 *                       name:
 *                         type: string
 *                         example: "Trader One"
 *                       description:
 *                         type: string
 *                         example: "Experienced crypto trader"
 *                       performance:
 *                         type: number
 *                         example: 0.85
 *                       numberOfTrades:
 *                         type: number
 *                         example: 100
 *                       active:
 *                         type: boolean
 *                         example: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-08T07:38:00.000Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-08T07:38:00.000Z"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid token"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */
router.get("/traders", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const traders = await Trader.find({ active: true });
    res.json({ success: true, data: traders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🤝 User select trader
/**
 * @swagger
 * /user/select-trader:
 *   put:
 *     summary: Select a trader
 *     description: Assign or update a trader for the authenticated user.
 *     tags: [Traders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               traderId:
 *                 type: string
 *                 nullable: true
 *                 example: "507f1f77bcf86cd799439012"
 *             required: [traderId]
 *     responses:
 *       200:
 *         description: Trader selected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     first_name:
 *                       type: string
 *                       example: "John"
 *                     last_name:
 *                       type: string
 *                       example: "Doe"
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *                     country:
 *                       type: string
 *                       nullable: true
 *                       example: "USA"
 *                     phone:
 *                       type: string
 *                       nullable: true
 *                       example: "+1234567890"
 *                     total_balance:
 *                       type: number
 *                       example: 1000.50
 *                     total_deposit:
 *                       type: number
 *                       example: 500.00
 *                     total_profit:
 *                       type: number
 *                       example: 200.00
 *                     kyc_status:
 *                       type: string
 *                       example: "approved"
 *                     selected_trader:
 *                       type: string
 *                       nullable: true
 *                       example: "507f1f77bcf86cd799439012"
 *       400:
 *         description: Invalid trader ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid or inactive trader"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid token"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */
router.put("/user/select-trader", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized: No user found in request" });
    }
    const { traderId } = req.body;
    if (traderId) {
      const trader = await Trader.findById(traderId);
      if (!trader || !trader.active) {
        return res.status(400).json({ success: false, message: "Invalid or inactive trader" });
      }
    }
    const user = await User.findByIdAndUpdate(req.user.id, { selected_trader: traderId }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 💰 Create or update deposit address (admin only)
/**
 * @swagger
 * /admin/wallet-addresses:
 *   post:
 *     summary: Create or update a deposit address
 *     description: Create a new deposit address or update an existing one for a specific currency. Admin access required.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currency:
 *                 type: string
 *                 enum: [BTC, ETH, USDT]
 *                 example: "BTC"
 *               network:
 *                 type: string
 *                 example: "Bitcoin Mainnet"
 *               address:
 *                 type: string
 *                 example: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
 *             required: [currency, network, address]
 *     responses:
 *       200:
 *         description: Address created or updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439014"
 *                     currency:
 *                       type: string
 *                       example: "BTC"
 *                     network:
 *                       type: string
 *                       example: "Bitcoin Mainnet"
 *                     address:
 *                       type: string
 *                       example: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
 *       400:
 *         description: Invalid request (e.g., invalid currency, network, or address)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid currency, network, or address"
 *       403:
 *         description: Forbidden (not admin)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Admin access required"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid token"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */
router.post("/wallet-addresses", authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currency, network, address } = req.body;
    if (!["BTC", "ETH", "USDT"].includes(currency) || !network || !address) {
      return res.status(400).json({ success: false, message: "Invalid currency, network, or address" });
    }
    const walletAddress = await WalletAddress.findOneAndUpdate(
      { currency },
      { network, address },
      { upsert: true, new: true }
    );
    res.json({
      success: true,
      data: {
        id: walletAddress._id,
        currency: walletAddress.currency,
        network: walletAddress.network,
        address: walletAddress.address,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 📋 Get all deposit addresses (admin only)
/**
 * @swagger
 * /admin/wallet-addresses:
 *   get:
 *     summary: Get all deposit addresses
 *     description: Retrieve a list of all deposit addresses for supported currencies. Admin access required.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of deposit addresses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "507f1f77bcf86cd799439014"
 *                       currency:
 *                         type: string
 *                         example: "BTC"
 *                       network:
 *                         type: string
 *                         example: "Bitcoin Mainnet"
 *                       address:
 *                         type: string
 *                         example: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
 *       403:
 *         description: Forbidden (not admin)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Admin access required"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid token"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */
router.get("/wallet-addresses", authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const addresses = await WalletAddress.find();
    res.json({
      success: true,
      data: addresses.map((a) => ({
        id: a._id,
        currency: a.currency,
        network: a.network,
        address: a.address,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
