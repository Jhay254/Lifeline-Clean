# Database Optimization Guide

## Prisma Query Optimization

### 1. Use Select to Limit Fields

**Before (Fetches all fields):**
```typescript
const user = await prisma.user.findUnique({
    where: { id: userId }
});
```

**After (Only fetch needed fields):**
```typescript
const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
        id: true,
        email: true,
        name: true,
        // Don't fetch password, createdAt, etc.
    }
});
```

### 2. Add Database Indexes

Add indexes to frequently queried fields in `schema.prisma`:

```prisma
model User {
    id        String   @id @default(uuid())
    email     String   @unique  // Already indexed
    createdAt DateTime @default(now())
    
    @@index([createdAt])  // Add index for sorting/filtering
}

model SocialAccount {
    id         String   @id @default(uuid())
    userId     String
    provider   Provider
    providerId String
    
    @@unique([userId, provider])
    @@index([provider])
    @@index([providerId])
}

model Media {
    id        String   @id @default(uuid())
    userId    String
    createdAt DateTime @default(now())
    
    @@index([userId])
    @@index([createdAt])
    @@index([userId, createdAt])  // Composite index for common query
}
```

### 3. Use Pagination

**Before (Fetches all records):**
```typescript
const media = await prisma.media.findMany({
    where: { userId }
});
```

**After (Paginated):**
```typescript
const media = await prisma.media.findMany({
    where: { userId },
    take: 20,  // Limit
    skip: page * 20,  // Offset
    orderBy: { createdAt: 'desc' }
});
```

### 4. Use Cursor-Based Pagination (Better Performance)

```typescript
const media = await prisma.media.findMany({
    where: { userId },
    take: 20,
    cursor: lastMediaId ? { id: lastMediaId } : undefined,
    orderBy: { createdAt: 'desc' }
});
```

### 5. Batch Queries with Include

**Before (N+1 Query Problem):**
```typescript
const users = await prisma.user.findMany();
for (const user of users) {
    const accounts = await prisma.socialAccount.findMany({
        where: { userId: user.id }
    });
}
```

**After (Single Query with Include):**
```typescript
const users = await prisma.user.findMany({
    include: {
        socialAccounts: true
    }
});
```

### 6. Use Connection Pooling

Already configured in Prisma! Default pool size is 10.

To customize, add to `DATABASE_URL`:
```
postgresql://user:password@localhost:5432/db?connection_limit=20
```

### 7. Use Transactions for Multiple Operations

```typescript
await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: userData });
    await tx.socialAccount.create({ data: { userId: user.id, ...accountData } });
    await tx.media.createMany({ data: mediaData });
});
```

## Redis Caching Strategy

### What to Cache

1. **User Data** (TTL: 15 minutes)
   - User profile
   - User preferences
   - Social account list

2. **Media Metadata** (TTL: 1 hour)
   - Media list for a user
   - Media counts
   - Media by date range

3. **OAuth Tokens** (Already cached via PKCE service)

4. **API Responses** (TTL: 5 minutes)
   - Public endpoints
   - Rarely changing data

### What NOT to Cache

- Authentication tokens (use JWT)
- Real-time data
- User-specific mutations
- Sensitive data

## Performance Monitoring

### Add Query Logging

In development, enable Prisma query logging:

```typescript
// prisma/schema.prisma
datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
}

generator client {
    provider = "prisma-client-js"
    previewFeatures = ["tracing"]
}
```

### Monitor Slow Queries

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
    ],
});

prisma.$on('query', (e) => {
    if (e.duration > 100) {  // Log queries slower than 100ms
        Logger.warn(`Slow query (${e.duration}ms): ${e.query}`);
    }
});
```

## Compression Benefits

- **Reduces bandwidth** by 60-80%
- **Faster response times** for clients
- **Lower hosting costs**

Compression is most effective for:
- JSON responses
- HTML/CSS/JS
- Text-based content

## Expected Performance Improvements

- **Response Time**: 30-50% faster with caching
- **Bandwidth**: 60-80% reduction with compression
- **Database Load**: 50-70% reduction with caching
- **Concurrent Users**: 3-5x more with optimizations
