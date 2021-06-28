FROM alpine:latest
RUN apk update && apk upgrade && apk add --update nodejs npm

WORKDIR /usr/src/hackerfill
COPY package.json package.json

RUN npm install

COPY . .
EXPOSE 3000
CMD [ "npm", "start" ]