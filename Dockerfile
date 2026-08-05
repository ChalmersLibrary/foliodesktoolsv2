ARG NODE_VERSION=24.11.1

# Create build stage
FROM node:${NODE_VERSION}-slim AS build

WORKDIR /app

# Install from the workspace root: the root lockfile is the single source of
# truth for both the server and the frontend workspace.
COPY ./package.json ./package-lock.json ./
COPY ./frontend/package.json ./frontend/

RUN npm ci

COPY ./frontend/ ./frontend/

# nuxt.config.ts sets nitro.output.publicDir to '../public' -> /app/public
RUN npm run build

FROM node:${NODE_VERSION}-slim

WORKDIR /app

# The frontend workspace is deliberately not copied here, so its dependencies
# stay out of the runtime image.
COPY ./package.json ./package-lock.json ./

RUN npm ci --omit=dev

COPY --from=build /app/public/ /app/public/
COPY ./server/ .

EXPOSE 3000

CMD ["node","/app/app.js"]
