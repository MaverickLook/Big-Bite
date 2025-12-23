import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/user.js";
import { JWT_SECRET } from "../config/env.js";
import { authMiddleware } from "../middleware/auth.js";
import { sendPasswordResetEmail, getEmailConfigStatus } from "../utils/emailService.js";


const router = express.Router();

router.get("/test-email-config", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const config = getEmailConfigStatus();
    return res.json({
      configured: config.configured,
      message: config.configured 
        ? "Email service is configured and ready" 
        : "Email service is NOT configured. Add EMAIL_USER and EMAIL_PASSWORD to your .env file.",
      config: {
        hasUser: config.hasUser,
        hasPassword: config.hasPassword,
        host: config.host,
        port: config.port,
        from: config.from,
        clientUrl: config.clientUrl,
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Error checking email config" });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phoneNumber, deliveryAddress } = req.body;

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashed,
      authProvider: "local",
      phoneNumber: typeof phoneNumber === "string" ? phoneNumber.trim() : undefined,
      deliveryAddress: typeof deliveryAddress === "string" ? deliveryAddress.trim() : undefined,
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        authProvider: newUser.authProvider,
        phoneNumber: newUser.phoneNumber || "",
        deliveryAddress: newUser.deliveryAddress || "",
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const foundUser = await User.findOne({ email });
    if (!foundUser)
      return res.status(404).json({ message: "User not found" });

    if (!foundUser.password) {
      return res.status(400).json({ message: "Please sign in with Google" });
    }

    const match = await bcrypt.compare(password, foundUser.password);
    if (!match)
      return res.status(400).json({ message: "Wrong password" });

    if (!foundUser.authProvider) {
      foundUser.authProvider = foundUser.googleId ? "google" : "local";
      await foundUser.save();
    }

    const token = jwt.sign(
      { id: foundUser._id, role: foundUser.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: foundUser._id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
        authProvider: foundUser.authProvider,
        phoneNumber: foundUser.phoneNumber || foundUser.phone || "",
        deliveryAddress: foundUser.deliveryAddress || foundUser.address || "",
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Backfill authProvider for existing users
    if (!user.authProvider) {
      user.authProvider = user.googleId ? "google" : "local";
      await user.save();
    }

    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      authProvider: user.authProvider,
      phoneNumber: user.phoneNumber || user.phone || "",
      deliveryAddress: user.deliveryAddress || user.address || "",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//update profile
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, phoneNumber, deliveryAddress } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (typeof name === "string" && name.trim() !== "") user.name = name.trim();
    if (typeof phoneNumber === "string") user.phoneNumber = phoneNumber.trim();
    if (typeof deliveryAddress === "string") user.deliveryAddress = deliveryAddress.trim();

    user.phone = user.phoneNumber;
    user.address = user.deliveryAddress;

    if (!user.authProvider) user.authProvider = user.googleId ? "google" : "local";

    await user.save();

    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      authProvider: user.authProvider,
      phoneNumber: user.phoneNumber || "",
      deliveryAddress: user.deliveryAddress || "",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress;

    console.log('\n=== FORGOT PASSWORD REQUEST ===');
    console.log('Email:', email);
    console.log('IP:', clientIp);
    console.log('Timestamp:', new Date().toISOString());

    if (!email) {
      console.log('✗ Validation failed: Email is required');
      return res.status(400).json({ message: "Email is required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('✗ Validation failed: Invalid email format');
      return res.status(400).json({ message: "Invalid email format" });
    }

    try {
      const user = await User.findOne({ email });
      console.log('User lookup:', user ? '✓ Found' : '✗ Not found');

      if (user && user.authProvider === "local" && user.password) {
        console.log('✓ Valid user found (local auth with password)');
        
        try {
          // Generate reset token (raw token for email, will be hashed before storing)
          const rawToken = crypto.randomBytes(32).toString("hex");
          const resetTokenExpiry = new Date();
          resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1);

          const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

          user.resetToken = hashedToken;
          user.resetTokenExpiry = resetTokenExpiry;
          await user.save();
          
          // Debug: Log expiry time
          console.log('✓ Reset token generated and saved (hashed)');
          console.log('Current time:', new Date().toISOString());
          console.log('Token expires at:', resetTokenExpiry.toISOString());
          console.log('Time difference (minutes):', ((resetTokenExpiry - new Date()) / 1000 / 60).toFixed(2));

          try {
            console.log('Attempting to send email...');
            await sendPasswordResetEmail(user.email, rawToken, user.name);
            console.log('✓ Email send completed successfully');
          } catch (emailError) {
            console.error("✗ Error sending reset email:", emailError.message);
          }
        } catch (saveError) {
          console.error("✗ Error saving reset token:", saveError.message);
        }
      } else {
        if (user) {
          console.log('⚠️  User found but not eligible (authProvider:', user.authProvider, ', hasPassword:', !!user.password, ')');
        }
      }
    } catch (dbError) {
      console.error("✗ Database error in forgot-password:", dbError.message);
    }

    console.log('✓ Returning success response');
    console.log('================================\n');
    return res.json({
      message: "If an account with that email exists, we've sent a reset link."
    });
  } catch (err) {
    console.error("✗ Unexpected error in forgot-password:", err);
    return res.json({
      message: "If an account with that email exists, we've sent a reset link."
    });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    console.log('\n=== RESET PASSWORD REQUEST ===');
    console.log('Token provided:', token ? '✓ Yes' : '✗ No');
    console.log('Password provided:', password ? '✓ Yes' : '✗ No');

    if (!token) {
      console.log('✗ Validation failed: Reset token is required');
      return res.status(400).json({ message: "Reset token is required" });
    }

    if (!password) {
      console.log('✗ Validation failed: Password is required');
      return res.status(400).json({ message: "Password is required" });
    }

    if (password.length < 6) {
      console.log('✗ Validation failed: Password too short');
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    console.log('Hashed token for lookup:', hashedToken.substring(0, 16) + '...');

    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: new Date() }
    });

    // Debug: Log token validation
    const currentTime = new Date();
    console.log('Token lookup at:', currentTime.toISOString());
    
    if (!user) {
      const userWithToken = await User.findOne({ resetToken: hashedToken });
      if (userWithToken) {
        console.log('⚠️  Token found but expired');
        console.log('Stored expiry:', userWithToken.resetTokenExpiry?.toISOString() || 'undefined');
        console.log('Current time:', currentTime.toISOString());
        console.log('Time difference (minutes):', userWithToken.resetTokenExpiry ? ((userWithToken.resetTokenExpiry - currentTime) / 1000 / 60).toFixed(2) : 'N/A');
      }
      console.log('✗ Invalid or expired token');
      return res.status(400).json({ 
        message: "Invalid or expired reset token. Please request a new password reset link." 
      });
    }

    console.log('✓ Valid token found for user:', user.email);

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    console.log('✓ Password reset successful');
    console.log('================================\n');

    return res.json({
      message: "Password has been successfully reset. You can now login with your new password."
    });
  } catch (err) {
    console.error("✗ Reset password error:", err);
    res.status(500).json({ message: "Failed to reset password" });
  }
});

router.post("/logout", (_req, res) => {
  res.json({ message: "Logged out" });
});

export default router;
