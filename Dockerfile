FROM node:22.23.4-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
ENV NODE_ENV=production
CMD ["node", "./bin/www"]
