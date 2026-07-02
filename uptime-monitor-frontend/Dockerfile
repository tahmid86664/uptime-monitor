FROM node:24-alpine AS builder
RUN corepack enable && corepack prepare yarn@4.9.2 --activate
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install --immutable
COPY . .
ENV npm_config_registry="https://registry.npmjs.org/"
ENV NEXT_TELEMETRY_DISABLED=1
RUN yarn build

FROM node:24-alpine AS production
ENV NODE_ENV=production
RUN apk add --no-cache dumb-init
RUN corepack enable && corepack prepare yarn@4.9.2 --activate
WORKDIR /app
RUN chown node:node /app
COPY --chown=node:node package.json yarn.lock ./
USER node
RUN yarn install --immutable 
COPY --chown=node:node --from=builder /app/.next ./.next
EXPOSE 3001
CMD ["dumb-init", "yarn", "start"]