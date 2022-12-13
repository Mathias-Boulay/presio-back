FROM node:19
COPY ./build /opt/app
COPY ./package.json /opt/app/package.json
WORKDIR /opt/app

RUN npm install
CMD node --watch /opt/app/index.js
