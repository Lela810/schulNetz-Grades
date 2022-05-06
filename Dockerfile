FROM node:12.18.1

ENV NODE_ENV=production \
    IS_DOCKER=true

WORKDIR /app

RUN mkdir db

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY . .

CMD [ "node", "index.js" ]

EXPOSE 8080

HEALTHCHECK --interval=5m --timeout=2s --start-period=10s CMD node /app/services/healthcheck.js