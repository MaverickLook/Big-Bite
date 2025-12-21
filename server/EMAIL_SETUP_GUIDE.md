# Email Setup Guide for Password Reset

## Quick Setup (Gmail - Recommended)

### Step 1: Enable 2-Step Verification
1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification**
3. Enable 2-Step Verification if not already enabled

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select **Mail** as the app
3. Select **Other (Custom name)** as the device
4. Enter "Big-Bite Server" as the name
5. Click **Generate**
6. Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Add to .env File
1. Create or edit `server/.env` file
2. Add these lines:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
EMAIL_FROM=your-email@gmail.com
```

**Important:** 
- Remove spaces from the app password (use: `abcdefghijklmnop` not `abcd efgh ijkl mnop`)
- Use your actual Gmail address for `EMAIL_USER` and `EMAIL_FROM`
- Use the 16-character app password (not your regular Gmail password)

### Step 4: Restart Server
After adding the credentials, restart your server to load the new environment variables.

## Testing Email Configuration

1. Start your server
2. Check the console output - you should see:
   ```
   === EMAIL SERVICE CONFIGURATION ===
   EMAIL_USER: ✓ Set
   EMAIL_PASSWORD: ✓ Set
   ✓ Email transporter created successfully
   ✓ Email service verified and ready
   ```

3. Try the forgot password flow
4. Check your email inbox (and spam folder)

## Troubleshooting

### If you see "Email credentials not configured"
- Check that `.env` file exists in the `server/` directory
- Verify all email variables are set (no typos)
- Make sure there are no extra spaces or quotes around values
- Restart the server after adding credentials

### If you see "Email service verification failed"
- Verify your app password is correct (16 characters, no spaces)
- Check that 2-Step Verification is enabled
- Try generating a new app password
- For Gmail, make sure "Less secure app access" is NOT needed (use App Password instead)

### If emails go to spam
- This is normal for automated emails
- Check your spam/junk folder
- The email will be from "Big-Bite Restaurant"

## Alternative Email Providers

### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=your-email@outlook.com
```

### Yahoo
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@yahoo.com
```

## Development Mode (No Email Setup)

If you don't want to configure email right now:
- The system will still work
- Reset links will be logged to the server console
- Look for: `⚠️  EMAIL NOT CONFIGURED - RESET LINK (for testing):`
- Copy the reset link from the console to test the reset flow

