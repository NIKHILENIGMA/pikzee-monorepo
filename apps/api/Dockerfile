# Stage 1: Build
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g pnpm@9
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json nx.json tsconfig.base.json ./
COPY apps/api ./apps/api
COPY libs ./libs
RUN pnpm install --frozen-lockfile
RUN pnpm nx build api --prod
RUN pnpm nx run api:prune-lockfile

# Stage 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN npm install -g pnpm@9
COPY --from=builder /app/dist/apps/api/package.json ./package.json
COPY --from=builder /app/dist/apps/api/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile --prod
COPY --from=builder /app/dist/apps/api/main.js ./main.js

EXPOSE 3001
CMD ["node", "main.js"]
