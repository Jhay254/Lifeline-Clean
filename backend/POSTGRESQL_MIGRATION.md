# PostgreSQL Migration Guide

## Prerequisites

You need Docker installed to run PostgreSQL locally.

### Install Docker Desktop for Windows
1. Download from: https://www.docker.com/products/docker-desktop/
2. Run the installer
3. Restart your computer
4. Start Docker Desktop

## Step 1: Start PostgreSQL with Docker

Once Docker is installed, run:

```bash
cd C:\Users\Administrator\Documents\Lifeline\backend
docker-compose up -d
```

This will:
- Download PostgreSQL 15 Alpine image
- Create a container named `lifeline-postgres`
- Expose PostgreSQL on port 5432
- Create a persistent volume for data

## Step 2: Update Your .env File

Update your `.env` file with the PostgreSQL connection string:

```env
DATABASE_URL="postgresql://lifeline:lifeline_dev_password@localhost:5432/lifeline_db"
JWT_SECRET=your_jwt_secret_key_change_in_production
FRONTEND_URL=http://localhost:3000
```

**Important**: Keep all your existing API credentials (Instagram, Twitter, etc.)

## Step 3: Run Prisma Migration

```bash
npx prisma db push
npx prisma generate
```

This will:
- Create all tables in PostgreSQL
- Generate the Prisma Client for PostgreSQL

## Step 4: Restart Your Server

```bash
npm run dev
```

## Verify Migration

Check that PostgreSQL is running:
```bash
docker ps
```

You should see `lifeline-postgres` in the list.

Test the connection:
```bash
npx prisma studio
```

This opens a GUI to view your database.

## Useful Docker Commands

**Stop PostgreSQL:**
```bash
docker-compose down
```

**Stop and remove data:**
```bash
docker-compose down -v
```

**View logs:**
```bash
docker-compose logs -f postgres
```

**Restart PostgreSQL:**
```bash
docker-compose restart
```

## Troubleshooting

### Port 5432 already in use
If you have another PostgreSQL instance running:
```bash
# Stop other PostgreSQL services
# Or change the port in docker-compose.yml:
ports:
  - "5433:5432"
# Then update DATABASE_URL to use port 5433
```

### Connection refused
Make sure Docker Desktop is running and the container is up:
```bash
docker-compose ps
```

### Data migration from SQLite
If you need to migrate existing data from SQLite:

1. Export from SQLite:
```bash
npx prisma db pull --schema=prisma/schema.sqlite.prisma
```

2. Use a migration tool or write a script to transfer data

## Alternative: Cloud PostgreSQL (No Docker Required)

If you prefer not to install Docker, use a free cloud database:

### Option 1: Neon (Recommended)
1. Go to https://neon.tech
2. Sign up (free)
3. Create a new project
4. Copy the connection string
5. Update your `.env` file with the connection string

### Option 2: Supabase
1. Go to https://supabase.com
2. Sign up (free)
3. Create a new project
4. Go to Settings > Database
5. Copy the connection string (use "Connection pooling" for better performance)
6. Update your `.env` file

### Option 3: Railway
1. Go to https://railway.app
2. Sign up (free $5 credit)
3. Create a new PostgreSQL database
4. Copy the connection string
5. Update your `.env` file

## Next Steps

After PostgreSQL is running:
1. ✅ Database migrated to PostgreSQL
2. ⏭️ Continue with Day 6-7: Background Job Processing
3. ⏭️ Set up Redis for job queues

---

**Current Status**: PostgreSQL schema updated, waiting for Docker installation or cloud database setup.
