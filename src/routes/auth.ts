import { Router, Request, Response } from "express";
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
import WalletAddress from "../models/WalletAddress";
import Transaction from "../models/Transaction";
import User from "../models/user"; // Note: Updated import to 'User' for consistency

const router = Router();

// 📝 User registration (public)
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: Jane
 *               last_name:
 *                 type: string
 *                 example: Smith
 *               email:
 *                 type: string
 *                 example: jane@example.com
 *               password:
 *                 type: string
 *                 example: MySecurePass456!
 *               country:
 *                 type: string
 *                 example: USA
 *               phone:
 *                 type: string
 *                 example: +1234567890
 *             required: [first_name, last_name, email, password, country, phone]
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
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
 *       400:
 *         description: Invalid input or email already exists
 *       500:
 *         description: Server error
 */
router.post("/register", registerUser);

// 🔐 User login (public)
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
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
 *                 example: jane@example.com
 *               password:
 *                 type: string
 *                 example: MySecurePass456!
 *             required: [email, password]
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
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
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", loginUser);

// 👤 Get authenticated user profile (protected)
/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get authenticated user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
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
 *                     selected_trader:
 *                       type: string
 *                       nullable: true
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", authMiddleware, getUserProfile);

// 📋 Get all users (admin only, protected)
/**
 * @swagger
 * /auth:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Auth]
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
 *       403:
 *         description: Forbidden (not admin)
 */
router.get("/", authMiddleware, getAllUsers);

// 👤 Get single user by ID (admin or self, protected)
/**
 * @swagger
 * /auth/{id}:
 *   get:
 *     summary: Get a single user by ID
 *     tags: [Auth]
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
 *         description: User retrieved
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
 *       404:
 *         description: User not found
 */
router.get("/:id", authMiddleware, getSingleUser);

// ✏️ Update user data (admin or self, protected)
/**
 * @swagger
 * /auth/{id}:
 *   put:
 *     summary: Update a user by ID
 *     tags: [Auth]
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
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               country:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 *       404:
 *         description: User not found
 */
router.put("/:id", authMiddleware, updateUser);

// 🗑️ Delete user (admin or self, protected)
/**
 * @swagger
 * /auth/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [Auth]
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
 *         description: User deleted
 *       404:
 *         description: User not found
 */
router.delete("/:id", authMiddleware, deleteUser);

// 💰 Get deposit addresses (protected)
/**
 * @swagger
 * /auth/wallet-addresses:
 *   get:
 *     summary: Get deposit addresses for BTC, ETH, USDT
 *     tags: [Auth]
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
 *                       currency:
 *                         type: string
 *                         enum: [BTC, ETH, USDT]
 *                       network:
 *                         type: string
 *                       address:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/wallet-addresses", authMiddleware, async (req: Request, res: Response) => {
  try {
    const addresses = await WalletAddress.find().select("currency network address");
    res.json({ success: true, data: addresses });
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 💸 Create deposit request (protected)
/**
 * @swagger
 * /auth/deposit:
 *   post:
 *     summary: Create a deposit request
 *     tags: [Auth]
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
 *               amount:
 *                 type: number
 *             required: [currency, amount]
 *     responses:
 *       200:
 *         description: Deposit request created
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
 *                     transaction:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         user:
 *                           type: string
 *                         type:
 *                           type: string
 *                         asset:
 *                           type: string
 *                         amount:
 *                           type: number
 *                         value:
 *                           type: number
 *                         fee:
 *                           type: number
 *                         status:
 *                           type: string
 *                         date:
 *                           type: string
 *                           format: date-time
 *                     depositAddress:
 *                       type: string
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
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
      value: amount, // Adjust if you have a conversion rate
      fee: 0, // Adjust as needed
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
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 📜 Get user transactions (protected)
/**
 * @swagger
 * /auth/transactions:
 *   get:
 *     summary: Get authenticated user's transactions
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
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
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Define bearerAuth for protected routes
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

export default router;