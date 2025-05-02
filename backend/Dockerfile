# Development stage
FROM node:18-bookworm-slim AS development

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

CMD ["npm", "run", "dev"]

# Production stage
FROM node:18-bookworm-slim AS production

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

CMD ["npm", "run", "start"]
