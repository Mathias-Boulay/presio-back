FROM node:18
COPY ./build /opt/app
COPY ./package.json /opt/app/package.json
copy ./src/edgedb.toml /opt/app/edgedb.toml
WORKDIR /opt/app

RUN npm install
CMD node --experimental-specifier-resolution=node ./index.js
