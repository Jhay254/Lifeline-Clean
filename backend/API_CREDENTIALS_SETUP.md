# API Credentials Setup Guide

This guide will walk you through obtaining API credentials for Instagram and Twitter/X to enable OAuth integration in the Lifeline application.

---

## Instagram API Setup

### Step 1: Create a Meta Developer Account
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click **"Get Started"** in the top right
3. Log in with your Facebook account (or create one if needed)
4. Complete the registration process

### Step 2: Create a New App
1. From the Meta Developer Dashboard, click **"My Apps"** → **"Create App"**
2. Select **"Consumer"** as the app type
3. Click **"Next"**
4. Fill in the app details:
   - **App Name**: `Lifeline` (or your preferred name)
   - **App Contact Email**: Your email address
5. Click **"Create App"**

### Step 3: Add Instagram Basic Display Product
1. In your app dashboard, scroll down to **"Add Products to Your App"**
2. Find **"Instagram Basic Display"** and click **"Set Up"**
3. Scroll down to **"Basic Display"** in the left sidebar
4. Click **"Create New App"** under Instagram App ID
5. Fill in the required fields:
   - **Display Name**: `Lifeline`
   - **Privacy Policy URL**: `http://localhost:3000/privacy` (temporary for development)
   - **Terms of Service URL**: `http://localhost:3000/terms` (temporary for development)
6. Click **"Create App"**

### Step 4: Configure OAuth Settings
1. In the **"Instagram Basic Display"** settings, scroll to **"OAuth Redirect URIs"**
2. Click **"Add OAuth Redirect URI"**
3. Enter: `http://localhost:3000/auth/instagram/callback`
4. Click **"Save Changes"**

### Step 5: Get Your Credentials
1. Scroll to the top of the **"Basic Display"** page
2. Copy the following values:
   - **Instagram App ID** → This is your `INSTAGRAM_CLIENT_ID`
   - **Instagram App Secret** → This is your `INSTAGRAM_CLIENT_SECRET`
3. Click **"Show"** next to App Secret to reveal it

### Step 6: Add Test Users (Development Only)
1. Scroll down to **"User Token Generator"**
2. Click **"Add Instagram Test User"**
3. Log in with the Instagram account you want to test with
4. Authorize the app

### Step 7: Update Your .env File
```env
INSTAGRAM_CLIENT_ID=your_instagram_app_id_here
INSTAGRAM_CLIENT_SECRET=your_instagram_app_secret_here
INSTAGRAM_REDIRECT_URI=http://localhost:3000/auth/instagram/callback
```

---

## Twitter/X API Setup

### Step 1: Create a Twitter Developer Account
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Click **"Sign up"** or **"Apply"** in the top right
3. Log in with your Twitter/X account
4. Complete the application form:
   - **Primary use case**: Select "Making a bot" or "Building tools for Twitter users"
   - **Will you make Twitter content available to government entities?**: Select "No"
   - Describe your use case: "Building a personal biography platform that imports user's tweets"
5. Agree to the Developer Agreement and submit

### Step 2: Create a New Project and App
1. Once approved, go to the [Developer Portal Dashboard](https://developer.twitter.com/en/portal/dashboard)
2. Click **"+ Create Project"**
3. Fill in project details:
   - **Project Name**: `Lifeline`
   - **Use Case**: Select "Exploring the API" or "Building tools for Twitter users"
   - **Project Description**: "Personal biography platform"
4. Click **"Next"**

### Step 3: Create an App
1. **App Name**: `Lifeline-Dev` (must be unique across all Twitter apps)
2. Click **"Complete"**
3. You'll see your API keys - **save these temporarily**, but we'll regenerate them in the next step

### Step 4: Configure OAuth 2.0 Settings
1. In your app dashboard, click on the **"Settings"** tab (gear icon)
2. Scroll down to **"User authentication settings"**
3. Click **"Set up"**
4. Configure the following:
   - **App permissions**: Select **"Read"**
   - **Type of App**: Select **"Web App, Automated App or Bot"**
   - **App info**:
     - **Callback URI / Redirect URL**: `http://localhost:3000/auth/twitter/callback`
     - **Website URL**: `http://localhost:3000`
   - **Organization details** (optional for development)
5. Click **"Save"**

### Step 5: Get Your OAuth 2.0 Credentials
1. After saving, you'll see your **OAuth 2.0 Client ID and Client Secret**
2. Copy these values:
   - **Client ID** → This is your `TWITTER_CLIENT_ID`
   - **Client Secret** → This is your `TWITTER_CLIENT_SECRET`
3. **IMPORTANT**: Save the Client Secret immediately - you won't be able to see it again!

### Step 6: Verify API Access Level
1. In the app dashboard, check your **"Access Level"**
2. For basic functionality, **"Free"** tier is sufficient
3. If you need more requests, you may need to upgrade to **"Basic"** ($100/month) or higher

### Step 7: Update Your .env File
```env
TWITTER_CLIENT_ID=your_twitter_client_id_here
TWITTER_CLIENT_SECRET=your_twitter_client_secret_here
TWITTER_REDIRECT_URI=http://localhost:3000/auth/twitter/callback
```

---

## Final Configuration

### Complete .env File
Your final `.env` file should look like this:

```env
DATABASE_URL="file:./dev.db"

# Instagram API Credentials
INSTAGRAM_CLIENT_ID=1234567890123456
INSTAGRAM_CLIENT_SECRET=abcdef1234567890abcdef1234567890
INSTAGRAM_REDIRECT_URI=http://localhost:3000/auth/instagram/callback

# Twitter API Credentials
TWITTER_CLIENT_ID=your_actual_client_id_here
TWITTER_CLIENT_SECRET=your_actual_client_secret_here
TWITTER_REDIRECT_URI=http://localhost:3000/auth/twitter/callback

# Server
PORT=3000
NODE_ENV=development
```

### Initialize the Database
After setting up your credentials, run:

```bash
cd backend
npx prisma db push
npx prisma generate
```

### Start the Development Server
```bash
npm run dev
```

---

## Testing Your Setup

### Test Instagram OAuth
1. Open your browser and navigate to: `http://localhost:3000/auth/instagram`
2. You should be redirected to Instagram's authorization page
3. Log in and authorize the app
4. You should be redirected back with a success message
5. Check your database - you should see records in `User`, `SocialAccount`, and `Content` tables

### Test Twitter OAuth
1. Open your browser and navigate to: `http://localhost:3000/auth/twitter`
2. You should be redirected to Twitter's authorization page
3. Log in and authorize the app
4. You should be redirected back with a success message
5. Check your database for new records

---

## Common Issues & Solutions

### Instagram Issues

**Issue**: "Redirect URI Mismatch"
- **Solution**: Ensure the redirect URI in your Meta app settings exactly matches `http://localhost:3000/auth/instagram/callback`

**Issue**: "Invalid Client ID"
- **Solution**: Double-check you're using the Instagram App ID (not Facebook App ID)

**Issue**: "User not authorized"
- **Solution**: Make sure you've added your Instagram account as a test user in the Meta Developer Dashboard

### Twitter Issues

**Issue**: "Invalid redirect URI"
- **Solution**: Verify the callback URL in Twitter Developer Portal matches exactly: `http://localhost:3000/auth/twitter/callback`

**Issue**: "403 Forbidden" when fetching tweets
- **Solution**: Check your API access level. Free tier has limited access. You may need to upgrade to Basic tier.

**Issue**: "Invalid client credentials"
- **Solution**: Regenerate your Client ID and Secret in the Twitter Developer Portal

### General Issues

**Issue**: "Environment variable not found"
- **Solution**: Make sure your `.env` file is in the `backend` directory and restart your server after making changes

**Issue**: Database connection errors
- **Solution**: Run `npx prisma db push` to create the database schema

---

## Production Considerations

When deploying to production, you'll need to:

1. **Update Redirect URIs** to your production domain (e.g., `https://lifeline.com/auth/instagram/callback`)
2. **Add production URLs** to both Instagram and Twitter app settings
3. **Use environment variables** from your hosting platform (not `.env` file)
4. **Switch to PostgreSQL** instead of SQLite for better performance
5. **Implement proper session management** instead of in-memory PKCE storage
6. **Add rate limiting** to prevent API quota exhaustion
7. **Submit apps for review** (Instagram requires app review for public access)

---

## Resources

- [Instagram Basic Display API Documentation](https://developers.facebook.com/docs/instagram-basic-display-api)
- [Twitter OAuth 2.0 Documentation](https://developer.twitter.com/en/docs/authentication/oauth-2-0)
- [Prisma Documentation](https://www.prisma.io/docs)
