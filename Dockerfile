FROM node:14

RUN apt-get update
RUN apt-get install -y dbus gconf-service libasound2 libatk1.0-0 libcairo2 libcups2 libfontconfig1 libgdk-pixbuf2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libxss1 fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils
RUN apt-get install -y unoconv ghostscript
RUN apt-get install -f -y
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && dpkg -i google-chrome*.deb

WORKDIR /usr/src/app

ADD package*.json ./

RUN npm install --only=production

ADD . .

ENV PORT 8080
ENV NODE_ENV=production

CMD [ "node", "index.js" ]