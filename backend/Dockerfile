FROM node:14.21-alpine AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM node:14.21-alpine AS builder

WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules

ARG NODE_ENV=production

RUN yarn build

# Production image, copy all the files and run next
FROM node:14.21-alpine AS runner

ARG NODE_ENV=production
ENV NODE_ENV=production

WORKDIR /app

RUN addgroup -g 1001 -S nodejs
RUN adduser -S keystonejs -u 1001
USER keystonejs

COPY --from=builder --chown=keystonejs:nodejs /app/.keystone ./.keystone
COPY --from=builder --chown=keystonejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=keystonejs:nodejs /app/package.json ./package.json

# RUN npx next telemetry disable

CMD ["yarn", "start"]
