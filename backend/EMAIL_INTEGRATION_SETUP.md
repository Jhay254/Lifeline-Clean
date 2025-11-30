# Email Integration Setup Guide

## Overview
Server-side email integration for Gmail and Outlook/Office 365 using OAuth 2.0.

**Privacy Note**: This is a server-side implementation. For production, consider migrating to zero-knowledge client-side processing.

---

## Gmail Setup

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Gmail API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Gmail API"
   - Click "Enable"

### 2. Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Configure consent screen if prompted:
   - User Type: External
   - App name: Lifeline
   - Support email: your email
   - Scopes: Add `gmail.readonly` and `userinfo.email`
4. Application type: **Web application**
5. Authorized redirect URIs:
   ```
   http://localhost:3000/auth/gmail/callback
   ```
6. Copy **Client ID** and **Client Secret**

### 3. Add to .env
```env
GMAIL_CLIENT_ID=your_client_id_here
GMAIL_CLIENT_SECRET=your_client_secret_here
GMAIL_REDIRECT_URI=http://localhost:3000/auth/gmail/callback
```

---

## Outlook/Office 365 Setup

### 1. Register App in Azure
1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" > "App registrations"
3. Click "New registration"
4. Name: Lifeline
5. Supported account types: **Accounts in any organizational directory and personal Microsoft accounts**
6. Redirect URI:
   - Platform: Web
   - URI: `http://localhost:3000/auth/outlook/callback`
7. Click "Register"

### 2. Create Client Secret
1. In your app, go to "Certificates & secrets"
2. Click "New client secret"
3. Description: Lifeline Backend
4. Expires: 24 months (or your preference)
5. Click "Add"
6. **Copy the secret value immediately** (you won't see it again)

### 3. Configure API Permissions
1. Go to "API permissions"
2. Click "Add a permission"
3. Select "Microsoft Graph"
4. Select "Delegated permissions"
5. Add these permissions:
   - `Mail.Read`
   - `User.Read`
   - `offline_access`
6. Click "Add permissions"
7. (Optional) Click "Grant admin consent" if you have admin rights

### 4. Add to .env
```env
OUTLOOK_CLIENT_ID=your_application_client_id
OUTLOOK_CLIENT_SECRET=your_client_secret_value
OUTLOOK_REDIRECT_URI=http://localhost:3000/auth/outlook/callback
```

---

## Testing

### Gmail
1. Navigate to: `http://localhost:3000/auth/gmail`
2. Sign in with your Google account
3. Grant permissions
4. Check database for `EmailMetadata` records

### Outlook
1. Navigate to: `http://localhost:3000/auth/outlook`
2. Sign in with your Microsoft account
3. Grant permissions
4. Check database for `EmailMetadata` records

---

## What Data is Stored

The system stores **metadata only**:
- Subject line
- Sender email
- Recipient email
- Timestamp
- Category (flight, hotel, receipt, event, personal)
- Has attachments (boolean)

**Email body content is NOT stored.**

---

## Email Categories

Emails are automatically categorized based on subject line keywords:
- **flight**: Contains "flight" or "boarding pass"
- **hotel**: Contains "hotel" or "reservation"
- **receipt**: Contains "receipt" or "invoice"
- **event**: Contains "ticket" or "event"
- **personal**: Everything else

---

## Next Steps

1. **Add credentials to `.env`**
2. **Restart server**: `npm run dev`
3. **Test OAuth flows**
4. **Verify data in database**

---

## Future Enhancements (Zero-Knowledge)

For production, consider:
- Electron desktop app for local processing
- Browser extension for client-side scanning
- End-to-end encryption
- User-controlled data retention policies
