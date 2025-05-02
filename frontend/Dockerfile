# --------------- Development build stage ---------------
    FROM node:18-bookworm-slim AS development

    WORKDIR /app
    COPY package*.json ./
    RUN npm ci
    COPY . .
    
    ARG VITE_API_URL
    ENV VITE_API_URL=$VITE_API_URL
    
    RUN npm run build
    
    # --------------- Production nginx stage ---------------
    FROM nginx:1.27.1-alpine AS production
    
    RUN rm /etc/nginx/conf.d/default.conf
    COPY nginx.conf /etc/nginx/conf.d/
    COPY --from=development /app/dist /usr/share/nginx/html
    
    EXPOSE 80
    CMD ["nginx", "-g", "daemon off;"]
    