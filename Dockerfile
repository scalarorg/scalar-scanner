FROM node:20.16.0-bookworm-slim
ARG ENV=prod
RUN apt update && apt install -y python3 make gcc g++
WORKDIR /app

COPY package.json package-lock* ./
# Omit --production flag for TypeScript devDependencies

COPY public ./public
COPY src ./src
COPY .env .
COPY .eslintrc.json .
COPY jsconfig.json .
COPY next.config.js .
COPY nginx.conf .
COPY postcss.config.js .
COPY prettier.config.js .
COPY tailwind.config.js .
COPY docker-entrypoint.sh .

# RUN npm run build-$ENV
RUN npm install
RUN npm run build 

EXPOSE 3000

ENTRYPOINT ["/app/docker-entrypoint.sh"]

CMD ["npm", "run", "dev"]

STOPSIGNAL SIGTERM