import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.js";
import jwt from "jsonwebtoken";

// Import from config
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
  JWT_SECRET,
  PORT,
  CLIENT_URL
} from "../config/env.js";

console.log("Passport - Checking environment variables:");
console.log("GOOGLE_CLIENT_ID:", GOOGLE_CLIENT_ID ? "Present" : "Missing");
console.log("GOOGLE_CLIENT_SECRET:", GOOGLE_CLIENT_SECRET ? "Present" : "Missing");

// Compute callback URL with fallback to localhost:PORT if not provided
const derivedCallbackUrl = GOOGLE_CALLBACK_URL;

if (!GOOGLE_CALLBACK_URL) {
  console.warn(
    `GOOGLE_CALLBACK_URL missing. Falling back to ${derivedCallbackUrl}. ` +
      "Set GOOGLE_CALLBACK_URL in .env to silence this warning."
  );
}

// Only enable Google strategy when all required env vars are present
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && JWT_SECRET && derivedCallbackUrl) {
  console.log("Passport - Initializing Google Strategy...");

  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: derivedCallbackUrl,
        passReqToCallback: true
      },
      async (request, accessToken, refreshToken, profile, done) => {
        try {
          console.log("Google profile received:", profile.id);
          
          if (!profile.emails || profile.emails.length === 0) {
            return done(new Error("No email found in Google profile"), null);
          }

          const email = profile.emails[0].value;
          const name = profile.displayName || profile.name?.givenName || "User";

          let foundUser = await User.findOne({ 
            $or: [
              { email },
              { googleId: profile.id }
            ]
          });

          if (!foundUser) {
            foundUser = await User.create({
              name,
              email,
              password: null,
              phone: "",
              address: "",
              authProvider: "google",
              phoneNumber: "",
              deliveryAddress: "",
              googleId: profile.id,
              role: "user",
            });
            console.log("New user created with Google OAuth:", email);
          } else {
            // Update googleId if user exists but doesn't have it
            if (!foundUser.googleId) {
              foundUser.googleId = profile.id;
              await foundUser.save();
            }
            console.log("Existing user logged in with Google:", email);
          }

          // Backfill authProvider for existing users
          if (!foundUser.authProvider) {
            foundUser.authProvider = "google";
            await foundUser.save();
          }

          const token = jwt.sign(
            { id: foundUser._id, role: foundUser.role },
            JWT_SECRET,
            { expiresIn: "7d" }
          );

          return done(null, {
            token,
            user: {
              id: foundUser._id,
              name: foundUser.name,
              email: foundUser.email,
              role: foundUser.role,
              authProvider: foundUser.authProvider,
              phoneNumber: foundUser.phoneNumber || foundUser.phone || "",
              deliveryAddress: foundUser.deliveryAddress || foundUser.address || "",
            },
          });
        } catch (err) {
          console.error("Google OAuth error:", err);
          return done(err, null);
        }
      }
    )
  );
} else {
  console.warn(
    "Google OAuth environment variables missing. Google login is disabled. " +
      "Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and JWT_SECRET to enable it."
  );
}

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user from the session
passport.deserializeUser((user, done) => {
  done(null, user);
});

console.log("Passport - Google Strategy initialized successfully");

export default passport;
