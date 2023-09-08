FROM node:20-slim

# Required for Puppeteer
RUN apt update
RUN apt install -y libgtk-3-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 xvfb

WORKDIR /runner
COPY . .
RUN npm install

EXPOSE 5050
ENTRYPOINT [ "node", "." ]