## 🔧 Fix DATABASE_URL Format

There's a format issue with the DATABASE_URL. Please update it in your `.env` file:

### Current (Incorrect):
```env
DATABASE_URL=postgresql://lifeline:lifeline_dev_password@localhost:5432/lifeline_db
```

### Corrected (Use this):
```env
DATABASE_URL="postgresql://lifeline:lifeline_dev_password@localhost:5432/lifeline_db?schema=public"
```

**Important changes:**
1. Add quotes around the entire URL
2. Add `?schema=public` at the end

### Your .env file should have:

```env
DATABASE_URL="postgresql://lifeline:lifeline_dev_password@localhost:5432/lifeline_db?schema=public"
JWT_SECRET=rhixsnIuX9HlpY0WqOCLyEJbt82PDMvA
FRONTEND_URL=http://localhost:3000
```

### ✅ After making this change, save the file and tell me "Updated"
