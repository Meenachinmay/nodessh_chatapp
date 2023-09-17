# Development stage
FROM node:18-alpine as development

WORKDIR /usr/src/app

RUN npm install -g typescript

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

RUN chmod 600 /usr/src/app/ssh-keys/my_host_ed25519_key

# Development runtime command
CMD [ "npx", "ts-node", "index.ts" ]