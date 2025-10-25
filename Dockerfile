# ---------- Build stage ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Install OS deps for node-gyp if ever needed
RUN apk add --no-cache python3 make g++

# Copy manifests first for better layer caching
COPY package.json package-lock.json* ./

# Install all deps (including dev for build)
RUN npm ci

# Copy source
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src

# Build Nest app (outputs to dist/)
RUN npm run build

# ---------- Runtime stage ----------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3001

# Copy only what's needed to run
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

# Health check (uses /v1/health)
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||3001)+'/v1/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))" || exit 1

EXPOSE 3001
CMD ["node", "dist/main.js"]