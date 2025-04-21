FROM node:18-bookworm-slim AS development

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL 
ARG VITE_BOT_URL
RUN VITE_API_URL=${VITE_API_URL} VITE_BOT_URL=${VITE_BOT_URL} npm run build

# Production stage
FROM nginx:alpine AS production
COPY --from=development /app/dist /usr/share/nginx/html
