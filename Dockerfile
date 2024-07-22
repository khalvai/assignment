FROM node:20 As development

WORKDIR /usr/src/app

RUN git clone https://github.com/vishnubob/wait-for-it.git
COPY --chown=node:node package*.json ./
COPY --chown=node:node yarn.lock ./

RUN yarn 
COPY --chown=node:node . .



RUN yarn prisma generate

EXPOSE 3000
CMD [ "yarn", "dev" ]


# BUILD FOR PRODUCTION

FROM node:20  As build

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./
COPY --chown=node:node yarn.lock ./

COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

RUN yarn run build

ENV NODE_ENV production

USER node

# PRODUCTION

FROM node:20  As production

COPY --chown=node:node --from=build /usr/src/app/node_modules ./app/node_modules
COPY --chown=node:node --from=build /usr/src/app/dist  ./app/dist
COPY .env /app/.env
ENV NODE_ENV=production
# start the server
CMD [ "node", "app/dist/main.js" ]