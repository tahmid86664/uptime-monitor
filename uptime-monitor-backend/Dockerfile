FROM node:24-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY tsconfig.json ./
COPY src ./src
RUN pnpm build

FROM node:24-alpine AS production
ENV NODE_ENV=production
RUN apk add --no-cache dumb-init
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
RUN chown node:node /app
COPY --chown=node:node package.json pnpm-lock.yaml ./
USER node
RUN pnpm install --frozen-lockfile --prod --ignore-scripts
COPY --chown=node:node --from=builder /app/dist ./dist
EXPOSE 8080
CMD ["dumb-init", "pnpm", "start"]