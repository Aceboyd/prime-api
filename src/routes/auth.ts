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
  logoutUser,
  logoutAdmin,
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
 *               first_name:
 *                 type: string
 *                 example: John
 *               last_name:
 *                 type: string
 *                 example: Doe
 *               country:
 *                 type: string
 *                 example: USA
 *               phone:
 *                 type: string
 *                 example: +1234567890
 *               role:
 *                 type: string
 *                 example: user
 *               confirmPassword:
 *                 type: string
 *                 example: SecurePass123!
 *             required:
 *               - email
 *               - password
 *               - first_name
 *               - last_name
 *               - confirmPassword
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
 *                 message:
 *                   type: string
 *                   example: User registered successfully
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
 *                     country:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     role:
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
 *                 token:
 *                   type: string
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
 *                 message:
 *                   type: string
 *                   example: Login successful
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
 *                     country:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     role:
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
 *                 token:
 *                   type: string
 *       400:
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
 *                 message:
 *                   type: string
 *                   example: Admin login successful
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
 *                     country:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     role:
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
 *                 token:
 *                   type: string
 *       400:
 *         description: Invalid credentials
 *       403:
 *         description: Access denied. Admins only.
 */
router.post("/admin/login", loginAdmin);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out user
 *     description: Logs out the authenticated user, instructing the client to clear the JWT token from storage. Requires user authentication.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User logged out successfully
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
 *                   example: User logged out successfully
 *       401:
 *         description: Unauthorized, token required
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
 *                   example: Invalid token
 *       403:
 *         description: Access denied. Users only.
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
 *                   example: Access denied. Users only.
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
 *                   example: Server error
 */
router.post("/logout", authMiddleware, logoutUser);

/**
 * @swagger
 * /auth/admin/logout:
 *   post:
 *     summary: Log out admin
 *     description: Logs out the authenticated admin, instructing the client to clear the JWT token from storage. Requires admin authentication.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin logged out successfully
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
 *                   example: Admin logged out successfully
 *       401:
 *         description: Unauthorized, token required
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
 *                   example: Invalid token
 *       403:
 *         description: Access denied. Admins only.
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
 *                   example: Access denied. Admins only.
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
 *                   example: Server error
 */
router.post("/admin/logout", authMiddleware, logoutAdmin);

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
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     country:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     role:
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
 *       401:
 *         description: Unauthorized, token required
 *       404:
 *         description: User not found
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
 *                       first_name:
 *                         type: string
 *                       last_name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       country:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       role:
 *                         type: string
 *                       total_balance:
 *                         type: number
 *                       total_deposit:
 *                         type: number
 *                       total_profit:
 *                         type: number
 *                       kyc_status:
 *                         type: string
 *                       selected_trader:
 *                         type: string
 *       401:
 *         description: Unauthorized, admin access required
 *       403:
 *         description: Access denied. Admin only.
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
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     country:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     role:
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
 *       401:
 *         description: Unauthorized, token required
 *       403:
 *         description: Access denied
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
 *               first_name:
 *                 type: string
 *                 example: Updated First
 *               last_name:
 *                 type: string
 *                 example: Updated Last
 *               email:
 *                 type: string
 *                 example: newemail@example.com
 *               country:
 *                 type: string
 *                 example: Canada
 *               phone:
 *                 type: string
 *                 example: +0987654321
 *               password:
 *                 type: string
 *                 example: NewPass123!
 *               confirmPassword:
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
 *                 message:
 *                   type: string
 *                   example: User updated successfully
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
 *                     country:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     role:
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
 *       400:
 *         description: Passwords do not match
 *       401:
 *         description: Unauthorized, token required
 *       403:
 *         description: Access denied
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
 *                   example: User deleted successfully
 *       401:
 *         description: Unauthorized, token required
 *       403:
 *         description: Access denied
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