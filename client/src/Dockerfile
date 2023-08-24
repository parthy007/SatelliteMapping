#node
FROM node:alpine3.17 as nodework
WORKDIR /app
COPY src/package.json ./
RUN npm install
COPY . .
RUN npm run build


#nginx
FROM nginx:1.25-alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=nodework /app/build .
ENTRYPOINT [ "nginx","-g","daemon off;" ]

