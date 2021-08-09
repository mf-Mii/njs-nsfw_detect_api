FROM node:12

WORKDIR /usr/app/nsfw/

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 19000

CMD ["node", "index.js"]