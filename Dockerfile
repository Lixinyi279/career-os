FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4173

COPY package.json ./
COPY . .

EXPOSE 4173
CMD ["node", "server.js"]
