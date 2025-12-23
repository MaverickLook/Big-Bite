import "./config/env.js";

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import passport from "./utils/passport.js";

import { PORT, MONGO_URI } from "./config/env.js";
import { verifyEmailConfig } from "./utils/emailService.js";

import foodRoutes from "./routes/foodRoutes.js"
const app = express();

app.use(cors());
// Larger limit image uploads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(passport.initialize());

import authRoutes from "./routes/authRoutes.js";
import googleAuth from "./routes/googleAuth.js";

import orderRoutes from "./routes/orderRoutes.js";

app.use("/api/auth", authRoutes);
app.use("/api/auth", googleAuth);
app.use("/api/foods", foodRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.send("Backend is working!");
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString()
  });
});

//connect to database
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    
    verifyEmailConfig().then((isConfigured) => {
      if (!isConfigured) {
        console.log('\n⚠️  Email service is not configured.');
        console.log('   Password reset emails will be logged to console only.');
        console.log('   To enable email sending, add to your .env file:');
        console.log('   EMAIL_HOST=smtp.gmail.com');
        console.log('   EMAIL_PORT=587');
        console.log('   EMAIL_USER=your-email@gmail.com');
        console.log('   EMAIL_PASSWORD=your-app-password');
        console.log('   EMAIL_FROM=your-email@gmail.com\n');
      }
    });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });