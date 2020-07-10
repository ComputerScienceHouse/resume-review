FROM alpine:3.12
LABEL maintainer="Ram Zallan <ramzallan@gmail.com>"

ENV NODE_VERSION 14.3.0

EXPOSE 8080

RUN apk add 'nodejs-current=14.4.0-r0' 'nodejs-npm=12.17.0-r0'

RUN mkdir /opt/resume-review
WORKDIR /opt/resume-review

COPY package*.json ./

RUN npm install

COPY . /opt/resume-review

USER 1001

CMD ["node", "app.js"]
