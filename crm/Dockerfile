# ---------- Сборка фронтенда (Node 20, версия на сервере не важна) ----------
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm install
COPY . .
RUN npm run build           # результат — /app/dist

# ---------- Рантайм: nginx раздаёт статику и проксирует API ----------
FROM nginx:1.27-alpine
# Шаблон конфига; nginx-образ сам прогонит его через envsubst при старте,
# подставив BACKEND_URL (и только его — благодаря NGINX_ENVSUBST_FILTER).
COPY docker/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

# Адрес шлюза бэкенда. По умолчанию — контейнер шлюза nginx в сети crm_network.
ENV BACKEND_URL=http://nginx
ENV NGINX_ENVSUBST_FILTER=BACKEND_URL

EXPOSE 80
