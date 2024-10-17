FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# TODO : to expose two ports for express and websocket
EXPOSE 3000

CMD ["node", "src/main.js"]
