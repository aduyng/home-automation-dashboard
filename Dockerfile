FROM node:lts-alpine as build
WORKDIR /workspace
COPY package.json package-lock.json ./
RUN npm install
COPY . ./
RUN npm run build

FROM nginx:stable
COPY --from=build /workspace/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]