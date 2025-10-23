# Next.js + Node.js
FROM node:20-alpine
WORKDIR /app
# Install deps (include devDeps for Next/TypeScript build). Skip scripts to avoid prisma generate before sources are copied
COPY package*.json ./
RUN npm ci --ignore-scripts
# Copy source
COPY . .
ENV NODE_ENV=production
# Build Next.js (runs prisma generate via package.json)
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]