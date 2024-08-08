FROM node:20.16.0-bookworm-slim AS builder
ARG ENV=dev
WORKDIR /app

COPY package.json package-lock* ./
# Omit --production flag for TypeScript devDependencies

COPY public ./public
COPY src ./src
COPY .env* .
COPY .eslintrc.json .
COPY jsconfig.json .
COPY next.config.js .
COPY nginx.conf .
COPY postcss.config.js .
COPY prettier.config.js .
COPY tailwind.config.js .

RUN npm install
RUN npm run build

# Production stage
FROM nginx:1.25.4-alpine AS production

# Set label for image
LABEL Name="scalar-xchains-scanner"

# Create directories
RUN mkdir /app
WORKDIR /usr/share/nginx/html/config

# Copy built files from build stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY --from=builder /app/nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 8080

# Install necessary packages
RUN apk add --no-cache bash

# # Set execute permission for env.sh
# RUN chmod +x /usr/share/nginx/html/config/env.sh

# Start Nginx server with environment setup
CMD ["/bin/bash", "-c", "nginx -g \"daemon off;\""]
# CMD ["/bin/bash", "-c", "/usr/share/nginx/html/config/env.sh && nginx -g \"daemon off;\""]
