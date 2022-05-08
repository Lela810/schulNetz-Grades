FROM node:16.14.0

ENV NODE_ENV=production \
    IS_DOCKER=true

WORKDIR /app

RUN mkdir db

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY . .

CMD [ "node", "index.js" ]