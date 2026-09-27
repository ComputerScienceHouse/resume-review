FROM node:24-alpine
LABEL maintainer="Ram Zallan <ramzallan@gmail.com>"

EXPOSE 8080

RUN mkdir /opt/resume-review
WORKDIR /opt/resume-review

COPY package*.json ./

RUN npm install

COPY . /opt/resume-review

RUN npm run build

ENV TZ="America/New_York"

USER 1001

CMD ["npm", "start"]
