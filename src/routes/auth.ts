import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  registerUser,
  loginUser,
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
import User from "../models/user";

const router = Router();

/* =====================================================
   🔐 AUTH ROUTES
===================================================== */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with the provided details. Only 'user' role is allowed.
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
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: SecurePass123!
 *               first_name:
 *                 type: string
 *                 example: John
 *               last_name:
 *                 type: string
 *                 example: Doe
 *               country:
 *                 type: string
 *                 nullable: true
 *                 example: USA
 *               phone:
 *                 type: string
 *                 nullable: true
 *                 example: +1234567890
 *               role:
 *                 type: string
 *                 enum: [user]
 *                 example: user
 *               confirmPassword:
 *                 type: string
 *                 minLength: 6
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
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Invalid input or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: Invalid input or user already exists
 */
router.post("/register", registerUser);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user and returns a JWT token with user details.
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
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
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
 *               $ref: '#/components/schemas/UserResponse'
 *               example:
 *                 success: true
 *                 message: Login successful
 *                 data:
 *                   id: "507f1f77bcf86cd799439011"
 *                   first_name: John
 *                   last_name: Doe
 *                   email: user@example.com
 *                   country: USA
 *                   phone: +1234567890
 *                   role: user
 *                   total_balance: 1000
 *                   total_deposit: 500
 *                   total_profit: 200
 *                   kyc_status: pending
 *                   selected_trader: null
 *                 token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: Invalid email or password
 */
router.post("/login", loginUser);

/**
 * @swagger
 * /auth/admin/login:
 *   post:
 *     summary: Admin login
 *     description: Authenticates an admin user and returns a JWT token with user details. Only users with role 'admin' can log in.
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
 *                 format: email
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
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
 *               $ref: '#/components/schemas/UserResponse'
 *               example:
 *                 success: true
 *                 message: Admin login successful
 *                 data:
 *                   id: "507f1f77bcf86cd799439011"
 *                   first_name: Gideon
 *                   last_name: Admin
 *                   email: gideonj666@gmail.com
 *                   country: null
 *                   phone: null
 *                   role: admin
 *                   total_balance: 0
 *                   total_deposit: 0
 *                   total_profit: 0
 *                   kyc_status: pending
 *                   selected_trader: null
 *                 token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Invalid credentials or missing fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: Invalid email or password
 *       403:
 *         description: Access denied. Admins only.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: Access denied. Admins only.
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: Server error
 */
router.post("/admin/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    // Check admin role
    if (user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. Admins only." });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    // Return response
    res.json({
      success: true,
      message: "Admin login successful",
      data: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        country: user.country || null,
        phone: user.phone || null,
        role: user.role,
        total_balance: user.total_balance || 0,
        total_deposit: user.total_deposit || 0,
        total_profit: user.total_profit || 0,
        kyc_status: user.kyc_status || "pending",
        selected_trader: user.selected_trader || null,
      },
      token,
    });
  } catch (error: any) {
    console.error("Admin login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

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
 *               $ref: '#/components/schemas/SuccessResponse'
 *               example:
 *                 success: true
 *                 message: User logged out successfully
 *       401:
 *         description: Unauthorized, token required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: Invalid token
 *       403:
 *         description: Access denied. Users only.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: Access denied. Users only.
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: Server error
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
 *               $ref: '#/components/schemas/SuccessResponse'
 *               example:
 *                 success: true
 *                 message: Admin logged out successfully
 *       401:
 *         description: Unauthorized, token required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: Invalid token
 *       403:
 *         description: Access denied. Admins only.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: Access denied. Admins only.
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: Server error
 */
router.post("/admin/logout", authMiddleware, logoutAdmin);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get authenticated user profile
 *     description: Retrieves the profile of the authenticated user.
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
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized, token required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: Invalid token
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: User not found
 */
router.get("/profile", authMiddleware, getUserProfile);

/**
 * @swagger
 * /auth:
 *   get:
 *     summary: Get all users (admin only)
 *     description: Retrieves a list of all users. Requires admin authentication.
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
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized, token required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: Invalid token
 *       403:
 *         description: Access denied. Admins only.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: Access denied. Admins only.
 */
router.get("/", authMiddleware, getAllUsers);

/**
 * @swagger
 * /auth/{id}:
 *   get:
 *     summary: Get a single user by ID
 *     description: Retrieves details of a user by ID. Admins can view any user; users can only view their own profile.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to retrieve
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
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized, token required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: Invalid token
 *       403:
 *         description: Access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: Access denied
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: User not found
 */
router.get("/:id", authMiddleware, getSingleUser);

/**
 * @swagger
 * /auth/{id}:
 *   put:
 *     summary: Update a user
 *     description: Updates user details. Admins can update any user; users can only update their own profile.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to update
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
 *                 format: email
 *                 example: newemail@example.com
 *               country:
 *                 type: string
 *                 nullable: true
 *                 example: Canada
 *               phone:
 *                 type: string
 *                 nullable: true
 *                 example: +0987654321
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: NewPass123!
 *               confirmPassword:
 *                 type: string
 *                 minLength: 6
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
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Passwords do not match or invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: Passwords do not match
 *       401:
 *         description: Unauthorized, token required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: Invalid token
 *       403:
 *         description: Access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: Access denied
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: User not found
 */
router.put("/:id", authMiddleware, updateUser);

/**
 * @swagger
 * /auth/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Deletes a user by ID. Only admins can delete users.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *               example:
 *                 success: true
 *                 message: User deleted successfully
 *       401:
 *         description: Unauthorized, token required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: Invalid token
 *       403:
 *         description: Access denied. Admins only.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: Access denied. Admins only.
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: User not found
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
 *     description: Retrieves a list of available wallet addresses for deposits.
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
 *                         enum: [BTC, ETH, USDT]
 *                         example: BTC
 *                       network:
 *                         type: string
 *                         example: Bitcoin
 *                       address:
 *                         type: string
 *                         example: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
 *       401:
 *         description: Unauthorized, token required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: Invalid token
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: Server error
 */
router.get("/wallet-addresses", authMiddleware, async (req: Request, res: Response) => {
  try {
    const addresses = await WalletAddress.find().select("currency network address");
    res.json({ success: true, data: addresses });
  } catch (error: any) {
    console.error("Get wallet addresses error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * @swagger
 * /auth/deposit:
 *   post:
 *     summary: Create a deposit
 *     description: Creates a new deposit transaction for the authenticated user.
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
 *                 minimum: 0.0001
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
 *                       $ref: '#/components/schemas/Transaction'
 *                     depositAddress:
 *                       type: string
 *                       example: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
 *       400:
 *         description: Invalid currency or amount
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: Invalid currency or amount
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: Server error
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
  } catch (error: any) {
    console.error("Deposit error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * @swagger
 * /auth/transactions:
 *   get:
 *     summary: Get user transactions
 *     description: Retrieves a list of transactions for the authenticated user.
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
 *                     $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: Unauthorized, token required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: Invalid token
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: Server error
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
  } catch (error: any) {
    console.error("Get transactions error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *         first_name:
 *           type: string
 *           example: John
 *         last_name:
 *           type: string
 *           example: Doe
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         country:
 *           type: string
 *           nullable: true
 *           example: USA
 *         phone:
 *           type: string
 *           nullable: true
 *           example: +1234567890
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           example: user
 *         total_balance:
 *           type: number
 *           example: 1000
 *         total_deposit:
 *           type: number
 *           example: 500
 *         total_profit:
 *           type: number
 *           example: 200
 *         kyc_status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           example: pending
 *         selected_trader:
 *           type: string
 *           nullable: true
 *           example: null
 *     UserResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: User registered successfully
 *         data:
 *           $ref: '#/components/schemas/User'
 *         token:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     Transaction:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 507f1f77bcf86cd799439012
 *         user:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *         type:
 *           type: string
 *           enum: [deposit, withdrawal]
 *           example: deposit
 *         asset:
 *           type: string
 *           enum: [BTC, ETH, USDT]
 *           example: BTC
 *         amount:
 *           type: number
 *           example: 0.01
 *         value:
 *           type: number
 *           example: 0.01
 *         fee:
 *           type: number
 *           example: 0
 *         status:
 *           type: string
 *           enum: [pending, completed, failed]
 *           example: pending
 *         date:
 *           type: string
 *           format: date-time
 *           example: 2025-10-12T16:21:00Z
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Operation successful
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: Error message
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: JWT token required for authenticated routes
 */

export default router;