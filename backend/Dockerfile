# backend/Dockerfile
FROM node:18-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5002
CMD ["npm", "run", "dev"]
