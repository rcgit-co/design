# Фронтенд в Docker (отдельный контейнер)

Образ собирает приложение на Node 20 внутри себя (версия Node на сервере не
важна) и раздаёт статику через nginx, проксируя `/api`, `/healthz`, `/health`
на шлюз бэкенда.

## Быстрый старт (отдельный compose, свой порт)

1. Узнайте имя docker-сети бэкенда:
   ```bash
   docker network ls | grep crm
   # например: backend_crm_crm_network
   ```
2. Создайте `.env` рядом с `docker-compose.frontend.yml`:
   ```bash
   cp .env.frontend.example .env
   ```
   и впишите свои значения:
   ```ini
   FRONTEND_PORT=9100                       # ваш порт (любой свободный)
   BACKEND_URL=http://nginx                 # шлюз внутри сети бэкенда
   BACKEND_NETWORK=backend_crm_crm_network  # из шага 1
   ```
3. Запуск:
   ```bash
   docker compose -f docker-compose.frontend.yml up -d --build
   ```
   Фронт будет на `http://<сервер>:9100`.

Порт можно задать и без .env, прямо в команде:
```bash
FRONTEND_PORT=9100 BACKEND_NETWORK=backend_crm_crm_network \
  docker compose -f docker-compose.frontend.yml up -d --build
```

## Переменные

| Переменная | Назначение | По умолчанию |
|---|---|---|
| `FRONTEND_PORT` | внешний порт фронта | `8090` |
| `BACKEND_URL` | адрес шлюза для прокси `/api` | `http://nginx` |
| `BACKEND_NETWORK` | имя docker-сети бэкенда (external) | `backend_crm_crm_network` |

## Если фронт НЕ в одной сети с бэкендом

Тогда не подключайте внешнюю сеть, а проксируйте на хост (порт 8081, который у
шлюза бэкенда проброшен наружу). Соберите и запустите напрямую:

```bash
docker build -t crm-frontend .

docker run -d --name crm_frontend -p 9100:80 \
  --add-host host.docker.internal:host-gateway \
  -e BACKEND_URL=http://host.docker.internal:8081 \
  crm-frontend
```
(или подставьте внешний IP/домен шлюза в `BACKEND_URL`). Здесь `9100` — ваш порт.

## Проверка

```bash
curl -I http://localhost:9100/            # 200 (index.html, SPA)
curl  http://localhost:9100/api/health    # ответ от бэкенда через шлюз
```

502 на `/api/...` → фронт не видит шлюз: проверьте `BACKEND_URL` и что контейнер
в нужной сети (или что хост-адрес/порт верны).
