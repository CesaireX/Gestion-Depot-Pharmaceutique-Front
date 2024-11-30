FROM node:18 as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --configuration=production

FROM nginx:alpine
COPY --from=build-stage /app/dist/ultima-ng /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY ./ssl /etc/nginx/ssl
