# Quick Guide: Adding Your Instagram/Meta API Credentials

## Where to Put Your Credentials

Your API credentials go in the `.env` file located in the `backend` directory.

### Step 1: Create the .env file (if it doesn't exist)

Navigate to the backend directory and copy the example file:

```bash
cd backend
copy .env.example .env
```

Or if `.env` already exists, just open it for editing.

### Step 2: Add Your Instagram Credentials

Open `backend/.env` and update these lines:

```env
# Instagram API Credentials
INSTAGRAM_CLIENT_ID=your_instagram_app_id_here
INSTAGRAM_CLIENT_SECRET=your_instagram_app_secret_here
INSTAGRAM_REDIRECT_URI=http://localhost:3000/auth/instagram/callback
```

**Replace with your actual values:**
- `INSTAGRAM_CLIENT_ID` = Your Instagram App ID (from Meta Developer Dashboard)
- `INSTAGRAM_CLIENT_SECRET` = Your Instagram App Secret (from Meta Developer Dashboard)

### What You Received from Meta

If you received a **"Meta Graph API Token"**, this is likely one of two things:

#### Option A: App Credentials (Most Common)
You should have received:
1. **Instagram App ID** → Use this for `INSTAGRAM_CLIENT_ID`
2. **Instagram App Secret** → Use this for `INSTAGRAM_CLIENT_SECRET`

These are found in your Meta Developer Dashboard under:
- **Instagram Basic Display** → **Basic Display** → Top of the page

#### Option B: User Access Token (For Testing)
If you received a **User Access Token** (a long string starting with something like `IGQVJx...`), this is a temporary token for testing. You don't need to put this in the `.env` file - our OAuth flow will generate these automatically.

### Complete .env File Example

Your complete `.env` file should look like this:

```env
DATABASE_URL="file:./dev.db"

# Instagram API Credentials
INSTAGRAM_CLIENT_ID=1234567890123456
INSTAGRAM_CLIENT_SECRET=abcdef1234567890abcdef1234567890
INSTAGRAM_REDIRECT_URI=http://localhost:3000/auth/instagram/callback

# Twitter API Credentials (leave these for now if you don't have them yet)
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
TWITTER_REDIRECT_URI=http://localhost:3000/auth/twitter/callback

# Server
PORT=3000
NODE_ENV=development
```

### Step 3: Initialize the Database

After updating your `.env` file, run these commands:

```bash
cd backend
npx prisma db push
npx prisma generate
```

### Step 4: Start the Server

```bash
npm run dev
```

### Step 5: Test the Integration

Open your browser and navigate to:
```
http://localhost:3000/auth/instagram
```

You should be redirected to Instagram to authorize the app.

---

## File Location Reference

```
Lifeline/
└── backend/
    ├── .env              ← PUT YOUR CREDENTIALS HERE
    ├── .env.example      ← Template file (don't edit this)
    └── src/
        └── services/
            └── instagram.service.ts  ← This file uses your credentials
```

---

## Troubleshooting

**If you see "Environment variable not found":**
- Make sure `.env` is in the `backend` directory (not the root)
- Restart your development server after editing `.env`

**If you see "Invalid credentials":**
- Double-check you copied the App ID and App Secret correctly
- Make sure there are no extra spaces or quotes around the values

**If you're still stuck:**
- Share the first few characters of your token (e.g., "It starts with IGQ..." or "It's a number like 123...")
- I can help identify what type of credential you have
