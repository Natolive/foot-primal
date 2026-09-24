FROM node:alpine
WORKDIR /repo
COPY . .
RUN npm ci
