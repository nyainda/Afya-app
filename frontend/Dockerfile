FROM node:14.21-alpine AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Rebuild the source code only when needed
FROM node:14.21-alpine AS builder

WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules

ARG NODE_ENV=production
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_STRIPE_KEY

RUN yarn build

# Production image, copy all the files and run next
FROM node:14.21-alpine AS runner

ARG NODE_ENV=production
ENV NODE_ENV=production
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_STRIPE_KEY

WORKDIR /app

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# RUN npx next telemetry disable

CMD ["yarn", "start"]
