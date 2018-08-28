FROM node:alpine

RUN mkdir -m 0777 -p /usr/app
USER node
WORKDIR /usr/app
COPY . .

# Set these two values if you have a corporate proxy
# RUN npm config set proxy <your-proxy-url>
# RUN npm config set https_proxy <your-proxy-url>
RUN npm install

EXPOSE 3000
EXPOSE 3001
CMD ["npm", "start"]
