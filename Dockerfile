FROM node:20.11-alpine3.18

WORKDIR /app

# Everything except .dockerignore
COPY . .

RUN npm i --omit=dev

ENV NODE_ENV production

EXPOSE 5555

CMD ["npm", "run", "production"]
