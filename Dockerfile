# syntax=docker/dockerfile:1.7

# ---------- Stage 1: builder ----------
FROM node:22-alpine AS builder
WORKDIR /app

# Install all dependencies (including dev) using the lockfile when present.
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy sources and build.
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build

# Strip dev dependencies from node_modules so the runtime stage stays lean.
RUN npm prune --omit=dev

# ---------- Stage 2: runtime ----------
FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    LOG_LEVEL=info

# Add a small init shim and curl for healthchecks.
RUN apk add --no-cache curl tini

# Run as the built-in non-root `node` user.
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node package.json ./

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -fsS http://127.0.0.1:3000/health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/server.js"]
