FROM node:22

WORKDIR /app

RUN apt-get update && apt-get install -y docker.io git

COPY package*.json ./

COPY prisma ./prisma

RUN npm install

COPY . .

RUN npm run build

EXPOSE 5000

CMD ["npm", "run", "start"]