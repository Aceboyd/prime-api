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
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// 📋 Get all users (admin only)
/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users (admin only)
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
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       first_name:
 *                         type: string
 *                       last_name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       total_balance:
 *                         type: number
 *                       total_deposit:
 *                         type: number
 *                       total_profit:
 *                         type: number
 *                       kyc_status:
 *                         type: string
 *       403:
 *         description: Forbidden (not admin)
 *       401:
 *         description: Unauthorized
 */
router.get("/users", authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await User.find().select("-password");
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✏️ Update user details (admin only)
/**
 * @swagger
 * /admin/users/{id}:
 *   put:
 *     summary: Update user details (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               total_balance:
 *                 type: number
 *               total_deposit:
 *                 type: number
 *               total_profit:
 *                 type: number
 *               kyc_status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *               selected_trader:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: User updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     total_balance:
 *                       type: number
 *                     total_deposit:
 *                       type: number
 *                     total_profit:
 *                       type: number
 *                     kyc_status:
 *                       type: string
 *       404:
 *         description: User not found
 *       403:
 *         description: Forbidden (not admin)
 */
router.put("/users/:id", authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { total_balance, total_deposit, total_profit, kyc_status, selected_trader } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { total_balance, total_deposit, total_profit, kyc_status, selected_trader },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 💰 Create transaction (admin only)
/**
 * @swagger
 * /admin/transactions:
 *   post:
 *     summary: Create a transaction (admin only)
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
 *               type:
 *                 type: string
 *                 enum: [deposit, withdraw, trade]
 *               asset:
 *                 type: string
 *               amount:
 *                 type: number
 *               value:
 *                 type: number
 *               fee:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [pending, completed, failed]
 *             required: [userId, type, asset, amount, value, status]
 *     responses:
 *       200:
 *         description: Transaction created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     user:
 *                       type: string
 *                     type:
 *                       type: string
 *                     asset:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     value:
 *                       type: number
 *                     fee:
 *                       type: number
 *                     status:
 *                       type: string
 *                     date:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid request
 *       403:
 *         description: Forbidden (not admin)
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

    // Update user balances if transaction is completed
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
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 📜 Get transactions for a user (admin only)
/**
 * @swagger
 * /admin/users/{id}/transactions:
 *   get:
 *     summary: Get transactions for a user (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       user:
 *                         type: string
 *                       type:
 *                         type: string
 *                       asset:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       value:
 *                         type: number
 *                       fee:
 *                         type: number
 *                       status:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date-time
 *       404:
 *         description: User not found
 *       403:
 *         description: Forbidden (not admin)
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
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🤝 Create trader (admin only)
/**
 * @swagger
 * /admin/traders:
 *   post:
 *     summary: Create a trader (admin only)
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
 *               description:
 *                 type: string
 *               performance:
 *                 type: number
 *               active:
 *                 type: boolean
 *             required: [name]
 *     responses:
 *       200:
 *         description: Trader created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     performance:
 *                       type: number
 *                     active:
 *                       type: boolean
 *       400:
 *         description: Invalid request
 *       403:
 *         description: Forbidden (not admin)
 */
router.post("/traders", authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const trader = new Trader(req.body);
    await trader.save();
    res.json({ success: true, data: trader });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 📋 Get all traders (admin only)
/**
 * @swagger
 * /admin/traders:
 *   get:
 *     summary: Get all traders (admin only)
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
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       performance:
 *                         type: number
 *                       active:
 *                         type: boolean
 *       403:
 *         description: Forbidden (not admin)
 */
router.get("/traders", authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const traders = await Trader.find();
    res.json({ success: true, data: traders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🤝 Assign trader to user (admin only)
/**
 * @swagger
 * /admin/users/{id}/assign-trader:
 *   put:
 *     summary: Assign a trader to a user (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               traderId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Trader assigned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     selected_trader:
 *                       type: string
 *       404:
 *         description: User not found
 *       403:
 *         description: Forbidden (not admin)
 */
router.put("/users/:id/assign-trader", authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { traderId } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { selected_trader: traderId }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 💰 Create or update deposit address (admin only)
/**
 * @swagger
 * /admin/wallet-addresses:
 *   post:
 *     summary: Create or update a deposit address (admin only)
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
 *               network:
 *                 type: string
 *               address:
 *                 type: string
 *             required: [currency, network, address]
 *     responses:
 *       200:
 *         description: Address created or updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     currency:
 *                       type: string
 *                     network:
 *                       type: string
 *                     address:
 *                       type: string
 *       400:
 *         description: Invalid request
 *       403:
 *         description: Forbidden (not admin)
 *       500:
 *         description: Server error
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
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 📋 Get all deposit addresses (admin only)
/**
 * @swagger
 * /admin/wallet-addresses:
 *   get:
 *     summary: Get all deposit addresses (admin only)
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
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       currency:
 *                         type: string
 *                       network:
 *                         type: string
 *                       address:
 *                         type: string
 *       403:
 *         description: Forbidden (not admin)
 *       500:
 *         description: Server error
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
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;