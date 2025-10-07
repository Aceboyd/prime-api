import { Router, Request, Response } from "express";
import {
  registerUser,
  loginUser,
  loginAdmin,
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
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: SecurePass123!
 *               name:
 *                 type: string
 *                 example: John Doe
 *             required:
 *               - email
 *               - password
 *               - name
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
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *       400:
 *         description: Invalid input or user already exists
 */
router.post("/register", registerUser);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
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
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: SecurePass123!
 *             required:
 *               - email
 *               - password
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
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         name:
 *                           type: string
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", loginUser);

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
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Admin logged in successfully
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
 *                     token:
 *                       type: string
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         role:
 *                           type: string
 *                           example: admin
 *       401:
 *         description: Invalid credentials or not an admin
 */
router.post("/admin/login", loginAdmin);

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
 *         description: User profile retrieved successfully
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
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *       401:
 *         description: Unauthorized, token required
 */
router.get("/profile", authMiddleware, getUserProfile);

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
 *         description: List of all users
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
 *                       email:
 *                         type: string
 *                       name:
 *                         type: string
 *       401:
 *         description: Unauthorized, admin access required
 */
router.get("/", authMiddleware, getAllUsers);

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
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details retrieved successfully
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
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *       401:
 *         description: Unauthorized, token required
 *       404:
 *         description: User not found
 */
router.get("/:id", authMiddleware, getSingleUser);

/**
 * @swagger
 * /auth/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: newemail@example.com
 *               name:
 *                 type: string
 *                 example: Updated Name
 *               password:
 *                 type: string
 *                 example: NewPass123!
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
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *       401:
 *         description: Unauthorized, token required
 *       404:
 *         description: User not found
 */
router.put("/:id", authMiddleware, updateUser);

/**
 * @swagger
 * /auth/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
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
 *                   example: User deleted
 *       401:
 *         description: Unauthorized, token required
 *       404:
 *         description: User not found
 */
router.delete("/:id", authMiddleware, deleteUser);

/* =====================================================
   💰 WALLET & TRANSACTION ROUTES
===================================================== */

/**
 * @swagger
 * /auth/wallet-addresses:
 *   get:
 *     summary: Get wallet addresses
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of wallet addresses
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
 *                       currency:
 *                         type: string
 *                         example: BTC
 *                       network:
 *                         type: string
 *                         example: Bitcoin
 *                       address:
 *                         type: string
 *                         example: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
 *       401:
 *         description: Unauthorized, token required
 *       500:
 *         description: Server error
 */
router.get("/wallet-addresses", authMiddleware, async (req: Request, res: Response) => {
  try {
    const addresses = await WalletAddress.find().select("currency network address");
    res.json({ success: true, data: addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * @swagger
 * /auth/deposit:
 *   post:
 *     summary: Create a deposit
 *     tags: [Wallet]
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
 *                 example: BTC
 *               amount:
 *                 type: number
 *                 example: 0.01
 *             required:
 *               - currency
 *               - amount
 *     responses:
 *       200:
 *         description: Deposit created successfully
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
 *                     transaction:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         user:
 *                           type: string
 *                         type:
 *                           type: string
 *                           example: deposit
 *                         asset:
 *                           type: string
 *                           example: BTC
 *                         amount:
 *                           type: number
 *                           example: 0.01
 *                         value:
 *                           type: number
 *                           example: 0.01
 *                         fee:
 *                           type: number
 *                           example: 0
 *                         status:
 *                           type: string
 *                           example: pending
 *                         date:
 *                           type: string
 *                           format: date-time
 *                     depositAddress:
 *                       type: string
 *                       example: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
 *       400:
 *         description: Invalid currency or amount
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

/**
 * @swagger
 * /auth/transactions:
 *   get:
 *     summary: Get user transactions
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user transactions
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
 *                       user:
 *                         type: string
 *                       type:
 *                         type: string
 *                         example: deposit
 *                       asset:
 *                         type: string
 *                         example: BTC
 *                       amount:
 *                         type: number
 *                         example: 0.01
 *                       value:
 *                         type: number
 *                         example: 0.01
 *                       fee:
 *                         type: number
 *                         example: 0
 *                       status:
 *                         type: string
 *                         example: pending
 *                       date:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized, token required
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
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

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