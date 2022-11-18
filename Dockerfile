FROM node:latest

RUN npm install express --save
RUN npm install pg --save

WORKDIR /home/ubuntu

COPY parser.js /home/ubuntu/parser.js

CMD ["node", "/home/ubuntu/parser.js"]
