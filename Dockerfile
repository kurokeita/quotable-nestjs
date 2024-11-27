FROM node:20.18.0-alpine3.20 AS base

# All deps stage
FROM base AS deps
WORKDIR /app
ADD package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Production only deps stage
FROM base AS production-deps
WORKDIR /app
ADD package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

# Build stage
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
ADD . .
RUN yarn build

# Production stage
FROM base
ENV NODE_ENV=production
WORKDIR /app
COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
EXPOSE 3000
CMD ["node", "dist/src/main"]