FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Cài đặt dependencies và devDependencies để build typescript
COPY package*.json ./
RUN npm ci

# Copy toàn bộ mã nguồn
COPY . .

# Biên dịch tsc và tsup ra thư mục lib
RUN npm run build

FROM node:20-slim

WORKDIR /usr/src/app

# Chỉ copy những file cần thiết cho môi trường chạy (runtime)
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/index.js ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/lib ./lib
COPY --from=builder /usr/src/app/client ./client

EXPOSE 8080

USER node

CMD ["npm", "run", "start"]