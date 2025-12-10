FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

COPY . .

RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

RUN npm run build

EXPOSE 80

CMD ["npm", "run", "start:dev"]
