FROM node:20-alpine AS build

WORKDIR /app/front

COPY front/package*.json ./
RUN npm install

COPY front ./
RUN npm run build

FROM nginx:1.27-alpine

COPY front/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/front/dist /usr/share/nginx/html

EXPOSE 80
