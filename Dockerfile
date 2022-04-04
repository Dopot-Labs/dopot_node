FROM node:16
EXPOSE 4002
EXPOSE 4003
EXPOSE 5002
EXPOSE 9090
# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN yarn

# Bundle app source
COPY . .

CMD [ "yarn", "start" ]
