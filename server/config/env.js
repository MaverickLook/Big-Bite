import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, "../.env") });

// Export environment variables (with sensible defaults where safe)
export const PORT = process.env.PORT || 5000;
export const MONGO_URI = process.env.MONGO_URI;
export const JWT_SECRET = process.env.JWT_SECRET;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;
export const CLIENT_URL = process.env.CLIENT_URL;

// Email configuration
export const EMAIL_HOST = process.env.EMAIL_HOST;
export const EMAIL_PORT = process.env.EMAIL_PORT;
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
export const EMAIL_FROM = process.env.EMAIL_FROM;

// Log to verify loading
console.log("=== Environment Variables Loaded ===");
console.log("PORT:", PORT ? "✓" : "✗");
console.log("MONGO_URI:", MONGO_URI ? "✓" : "✗");
console.log("JWT_SECRET:", JWT_SECRET ? "✓" : "✗");
console.log("GOOGLE_CLIENT_ID:", GOOGLE_CLIENT_ID ? "✓" : "✗");
console.log("GOOGLE_CLIENT_SECRET:", GOOGLE_CLIENT_SECRET ? "✓" : "✗");
console.log("CLIENT_URL:", CLIENT_URL ? "✓" : "✗");
console.log("EMAIL_HOST:", EMAIL_HOST ? "✓" : "✗");
console.log("EMAIL_PORT:", EMAIL_PORT ? "✓" : "✗");
console.log("EMAIL_USER:", EMAIL_USER ? "✓" : "✗");
console.log("EMAIL_PASSWORD:", EMAIL_PASSWORD ? "✓" : "✗");
console.log("EMAIL_FROM:", EMAIL_FROM ? "✓" : "✗");
console.log("====================================");