# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code and configuration files
COPY src ./src
COPY public ./public
COPY prisma ./prisma
COPY docker-entrypoint.sh ./
COPY tsconfig.json ./
COPY next.config.ts ./
COPY postcss.config.mjs ./
COPY eslint.config.mjs ./

# Generate Prisma client
RUN npx prisma generate

# Set build-time environment variables (placeholder for build only)
ENV DATABASE_URL="postgresql://placeholder:placeholder@placeholder:5432/placeholder"

# Build the application
RUN npm run build

# Runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application and configuration
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/docker-entrypoint.sh ./

# Install only production dependencies for runtime
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Install PostgreSQL client for health checks
RUN apk add --no-cache postgresql-client

# Copy necessary node_modules for Prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# Create database directory
RUN mkdir -p ./prisma

# Set environment variables (sensitive data to be provided at runtime)
ENV NODE_ENV="production"

# Set proper ownership
RUN chmod +x docker-entrypoint.sh
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Use custom entrypoint
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
