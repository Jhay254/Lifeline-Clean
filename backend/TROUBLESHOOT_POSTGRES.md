## 🔧 Try Alternative DATABASE_URL

The connection to PostgreSQL is failing. This is common on Windows Docker. Please try this alternative:

### Option 1: Use 127.0.0.1 instead of localhost

Change your DATABASE_URL in `.env` to:

```env
DATABASE_URL="postgresql://lifeline:lifeline_dev_password@127.0.0.1:5432/lifeline_db?schema=public"
```

Save and reply "Tried Option 1"

---

### Option 2: If Option 1 doesn't work, check Docker network

Run this command to get the container's IP:

```powershell
docker inspect lifeline-postgres | Select-String "IPAddress"
```

Then use that IP in your DATABASE_URL.

---

### Option 3: Restart Docker Desktop

Sometimes Docker networking needs a restart:
1. Right-click Docker Desktop in system tray
2. Click "Restart"
3. Wait for it to start
4. Try the migration again

Let me know which option you'd like to try first!
