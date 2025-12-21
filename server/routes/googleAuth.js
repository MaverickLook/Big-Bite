import express from "express";
import passport from "../utils/passport.js";
import { CLIENT_URL } from "../config/env.js";

const router = express.Router();

// Login with Google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false // Disable session since we're using JWT
  })
);

// Google redirect callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: CLIENT_URL || "/" // Redirect to frontend on failure
  }),
  (req, res) => {
    try {
      // Check if user data exists
      if (!req.user || !req.user.token) {
        return res.redirect((CLIENT_URL || "/") + "/login?error=google_auth_failed");
      }

      const { token, user } = req.user;

      // Redirect back to frontend with token and basic user info in query
      const redirectUrl = new URL((CLIENT_URL || "http://localhost:3000") + "/google-success");
      redirectUrl.searchParams.set("token", token);
      redirectUrl.searchParams.set("name", user.name);
      redirectUrl.searchParams.set("email", user.email);
      redirectUrl.searchParams.set("role", user.role || "user");

      return res.redirect(redirectUrl.toString());
    } catch (error) {
      console.error("Callback error:", error);
      return res.redirect((CLIENT_URL || "/") + "/login?error=google_internal_error");
    }
  }
);

export default router;