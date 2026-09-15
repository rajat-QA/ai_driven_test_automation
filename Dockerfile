FROM node:20-bookworm

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci
RUN npx playwright install --with-deps

COPY . .

ENV CI=true

CMD ["npx", "playwright", "test", "tests/e2e/bookings"]