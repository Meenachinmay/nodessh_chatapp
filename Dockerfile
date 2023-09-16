# Development stage
FROM node:18-alpine as development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

# Development runtime command
CMD [ "npm", "run", "dev" ]