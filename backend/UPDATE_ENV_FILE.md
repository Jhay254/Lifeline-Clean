## ⚠️ IMPORTANT: Update Your .env File

Please update your `.env` file with the following changes:

### 1. Update DATABASE_URL

**Replace this line:**
```env
DATABASE_URL=postgresql://lifeline:lifeline_dev_password@localhost:5432/lifeline_db
```
JWT_SECRET=rhixsnIuX9HlpY0WqOCLyEJbt82PDMvA
FRONTEND_URL=http://localhost:3000

**With this:**
```env
DATABASE_URL="postgresql://lifeline:lifeline_dev_password@localhost:5432/lifeline_db"
```

### 2. Add JWT_SECRET (if not already present)

Add this line:
```env
JWT_SECRET=your_secure_random_string_change_this_in_production
```

**Generate a secure JWT secret:**
You can use this PowerShell command to generate a random secret:
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### 3. Add FRONTEND_URL (if not already present)

Add this line:
```env
FRONTEND_URL=http://localhost:3000
```

### Complete .env Example

Your `.env` file should look like this:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://lifeline:lifeline_dev_password@localhost:5432/lifeline_db"

# JWT Secret
JWT_SECRET=your_secure_random_string_here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Instagram API Credentials
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
INSTAGRAM_REDIRECT_URI=http://localhost:3000/auth/instagram/callback

# Twitter API Credentials
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
TWITTER_REDIRECT_URI=http://localhost:3000/auth/twitter/callback

# Facebook API Credentials
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret
FACEBOOK_REDIRECT_URI=http://localhost:3000/auth/facebook/callback

# LinkedIn API Credentials
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:3000/auth/linkedin/callback

# Gmail API Credentials
GMAIL_CLIENT_ID=your_gmail_client_id
GMAIL_CLIENT_SECRET=your_gmail_client_secret
GMAIL_REDIRECT_URI=http://localhost:3000/auth/gmail/callback

# Outlook API Credentials
OUTLOOK_CLIENT_ID=your_outlook_client_id
OUTLOOK_CLIENT_SECRET=your_outlook_client_secret
OUTLOOK_REDIRECT_URI=http://localhost:3000/auth/outlook/callback

# Server
PORT=3000
NODE_ENV=development
```

### ✅ After updating .env, tell me and I'll continue with the migration!
