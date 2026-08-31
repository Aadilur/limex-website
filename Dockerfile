FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Prisma reads the datasource during schema generation, but does not connect here.
# Railway's DATABASE_URL replaces this build-only value at runtime.
RUN DATABASE_URL='postgresql://postgres:postgres@127.0.0.1:5432/limex?schema=public' npm run build

ENV NODE_ENV=production

# Railway publishes only the dynamic PORT. 3000 and 4000 remain internal ports.
EXPOSE 8080 3000 4000

CMD ["npm", "run", "start"]
