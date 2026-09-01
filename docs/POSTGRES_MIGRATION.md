# PostgreSQL Migration Guide

This document provides a comprehensive guide for migrating the ToDo App from in-memory storage to PostgreSQL with Prisma ORM.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Migration Steps](#database-migration-steps)
4. [Data Migration](#data-migration)
5. [Testing](#testing)
6. [Deployment](#deployment)
7. [Rollback Plan](#rollback-plan)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

- PostgreSQL 14.x or higher
- Node.js 18.x or higher
- npm or yarn package manager

## Environment Setup

### 1. Install Prisma CLI

Prisma is already installed as part of the project dependencies. Verify installation:

```bash
npx prisma --version
```

### 2. Configure Database URL

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL connection details:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/todoapp?schema=public"
TEST_DATABASE_URL="postgresql://user:password@localhost:5432/todoapp_test?schema=public"
```

**Connection String Format:**

```
postgresql://[user]:[password]@[host]:[port]/[database]?[parameters]
```

**Connection Pooling Parameters:**

- `pgbouncer=true` - Use PgBouncer for connection pooling (recommended for production)
- `connection_limit=10` - Maximum number of connections in the pool
- `pool_timeout=10` - Timeout for acquiring a connection from the pool

Example production connection string:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/todoapp?schema=public&pgbouncer=true&connection_limit=10"
```

## Database Migration Steps

### Phase 1: Create Database

```bash
# Create the database
createdb todoapp

# Create test database (for testing)
createdb todoapp_test
```

### Phase 2: Run Prisma Migrations

```bash
# Generate Prisma client
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name init

# For production
npx prisma migrate deploy
```

### Phase 3: Verify Setup

```bash
# Open Prisma Studio to view database
npx prisma studio

# Run health check
curl http://localhost:3000/api/health
```

## Data Migration

### Export Existing Data

If you have existing in-memory data, export it before migration:

```bash
npm run migrate:export > export-data.json
```

### Import Data to PostgreSQL

```bash
npm run migrate:import < export-data.json
```

### Verify Migration

```bash
# Check todo count
curl http://localhost:3000/api/todos | jq '.count'

# View all todos
curl http://localhost:3000/api/todos | jq '.data'
```

## Testing

### Run Tests with Test Database

```bash
# Set test database URL
export DATABASE_URL="postgresql://user:password@localhost:5432/todoapp_test?schema=public"

# Run tests
npm test
```

### Run Specific Test Suites

```bash
# Database tests
npm test src/__tests__/lib/database.test.ts

# Service layer tests
npm test src/__tests__/lib/todoService.test.ts

# API tests
npm test src/__tests__/api/
```

## Deployment

### Pre-Deployment Checklist

- [ ] Database created and migrations applied
- [ ] Environment variables configured
- [ ] Connection pooling enabled (PgBouncer recommended)
- [ ] Health check endpoint working
- [ ] Backup strategy in place

### Deployment Steps

1. **Set Environment Variables**

```bash
export DATABASE_URL="your-production-database-url"
```

2. **Run Migrations**

```bash
npx prisma migrate deploy
```

3. **Start Application**

```bash
npm run build
npm start
```

4. **Verify Health**

```bash
curl https://your-domain.com/api/health
```

### Production Configuration

**Recommended Connection Pool Settings:**

- Connection limit: 10-20 per application instance
- Pool timeout: 10 seconds
- Idle timeout: 30 seconds

**PgBouncer Configuration (Transaction Mode):**

```ini
[databases]
todoapp = host=localhost port=5432 dbname=todoapp

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 20
reserve_pool_size = 5
```

## Rollback Plan

### If Migration Fails

1. **Revert Code Changes**

```bash
git revert HEAD
```

2. **Restore In-Memory Storage**

The old `todoStore.ts` is still available but deprecated. You can temporarily switch back by updating imports in API routes.

3. **Database Rollback**

```bash
npx prisma migrate rollback
```

### Backup Strategy

Always backup your database before migration:

```bash
# PostgreSQL backup
pg_dump todoapp > backup-$(date +%Y%m%d).sql

# Restore from backup
psql todoapp < backup-20240101.sql
```

## Troubleshooting

### Connection Errors

**Error: "Can't reach database server"**

- Verify PostgreSQL is running: `pg_isready`
- Check connection string format
- Verify firewall rules

**Error: "Connection pool exhausted"**

- Increase connection limit in DATABASE_URL
- Implement connection pooling (PgBouncer)
- Check for connection leaks in application code

### Migration Errors

**Error: "Table already exists"**

```bash
# Reset database (WARNING: destroys all data)
npx prisma migrate reset
```

**Error: "Column does not exist"**

```bash
# Regenerate Prisma client
npx prisma generate
```

### Performance Issues

**Slow Queries (>200ms)**

- Check database indexes: `\d todos` in psql
- Analyze query performance: `EXPLAIN ANALYZE SELECT * FROM todos;`
- Verify connection pooling is working

**High Memory Usage**

- Reduce connection pool size
- Enable connection timeout
- Implement query pagination

### Health Check Issues

**Health check returns 503**

- Check database connectivity
- Verify DATABASE_URL environment variable
- Check PostgreSQL logs: `tail -f /var/log/postgresql/*.log`

**Latency exceeds 200ms target**

- Optimize database queries
- Check network latency
- Consider read replicas for heavy read workloads

## Monitoring

### Health Endpoint

The `/api/health` endpoint provides:

- Database connectivity status
- Query latency
- Performance metrics
- Uptime information

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345.67,
  "database": {
    "status": "healthy",
    "latency": 15
  },
  "performance": {
    "totalLatency": 20,
    "meetsTarget": true,
    "target": 200
  }
}
```

### Database Metrics

Monitor these metrics in production:

- Connection pool utilization
- Query latency percentiles (p50, p95, p99)
- Database size and growth
- Slow query log

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PgBouncer Documentation](https://www.pgbouncer.org/)
- [Next.js Database Integration](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-data)