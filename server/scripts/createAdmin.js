// Script to create an admin user or promote existing user to admin
// Run with: node scripts/createAdmin.js <email>

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import "../config/env.js";
import { MONGO_URI } from "../config/env.js";

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Get email from command line argument
    const email = process.argv[2];
    
    if (!email) {
      console.error("Usage: node scripts/createAdmin.js <email>");
      console.error("Example: node scripts/createAdmin.js admin@bigbite.com");
      process.exit(1);
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // Update existing user to admin
      existingUser.role = "admin";
      await existingUser.save();
      console.log(`✅ User ${email} has been promoted to admin!`);
    } else {
      // Create new admin user (requires password)
      const password = process.argv[3] || "admin123"; // Default password or from argument
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const newAdmin = new User({
        name: "Admin User",
        email: email,
        password: hashedPassword,
        role: "admin"
      });
      
      await newAdmin.save();
      console.log(`✅ Admin user created with email: ${email}`);
      console.log(`⚠️  Default password: ${password} - Please change it after first login!`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

createAdmin();

