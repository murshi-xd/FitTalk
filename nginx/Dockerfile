FROM nginx:latest

# Copy NGINX config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy SSL certificates
COPY certs/ /etc/nginx/certs/

# Expose ports
EXPOSE 80
EXPOSE 443
