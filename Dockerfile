ARG NODE_VERSION=24.11.1

# Create build stage
FROM node:${NODE_VERSION}-slim AS build

WORKDIR /app

COPY ./frontend/package.json ./
COPY ./frontend/package-lock.json ./

RUN npm install

COPY ./frontend/ .

RUN npm run generate

FROM node:${NODE_VERSION}-slim

WORKDIR /app

COPY ./package.json ./
COPY ./package-lock.json ./

RUN npm install

COPY --from=build /app/dist/ /app/public/
COPY ./server/ .

EXPOSE 3000

CMD ["node","/app/app.js"]