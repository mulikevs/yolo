# Build stage
FROM node:14-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --production

COPY . .

# Final stage
FROM alpine:3.16.7

WORKDIR /app

RUN apk add --no-cache nodejs npm
COPY --from=build /usr/src/app /app

EXPOSE 3000
CMD ["npm", "start"]
