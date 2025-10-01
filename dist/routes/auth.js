"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../controllers/auth");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post("/register", auth_1.createUser);
router.get("/login", auth_1.loginUser);
router.get("/users/:id", authMiddleware_1.authenticateUser, auth_1.getUserData);
router.put("/users/:id", authMiddleware_1.authenticateUser, auth_1.updateUser);
router.delete("/users/:id", authMiddleware_1.authenticateUser, auth_1.deleteUser);
exports.default = router;
//# sourceMappingURL=auth.js.map