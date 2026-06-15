# Реалти CRM — фронтенд

Веб-приложение (Vue 3 + Vite + Vue Router) для микросервисного бэкенда CRM
агентства недвижимости. Реализует рабочие сценарии всех доменов и общается с
бэкендом по REST через nginx-шлюз. Контракт выверен по исходникам бэкенда
(роутинг `public/index.php`, контроллеры, миграции).

## Запуск

```bash
npm install
npm run dev          # http://localhost:5180
```

Бэкенд должен быть поднят (`docker compose up -d`). Шлюз по умолчанию —
**http://localhost:8081**. Другой адрес:

```bash
GATEWAY=http://localhost:9000 npm run dev
```

CORS не нужен: фронт ходит на свой origin (`/api`), Vite-прокси перенаправляет
на шлюз (`vite.config.js`).

## Соответствие бэкенду

Конверт ответа `{ success, data }`, списки — `{ data: { <entity>: [...],
pagination: { total, limit, offset } } }`. Пагинация через `limit`/`offset`.

| Раздел | Эндпоинты (через шлюз) |
|---|---|
| Auth | `POST /api/login` (inn+login+password), `POST /api/register`, `POST /api/refresh`, `GET /api/me`, `POST /api/logout`. Токены в `data.tokens.{access_token,refresh_token}` |
| Сотрудники | `/api/profile/users` (CRUD), `PATCH …/role`, `…/activate`, `…/deactivate`, `GET /api/profile/profile/me`. Поля: name, phone, email, role(agent\|manager\|admin\|owner), comment |
| Агентство | `GET /api/agencies/me`, `PUT /api/agencies/{id}`, `GET/PUT …/branding` (color_bg,color_accent,font), `GET/POST …/contracts` |
| Объекты | `GET/POST /api/properties`, `GET …/search`, `PATCH …/status`, `…/media`, `…/complexes`, `…/developers`. Статусы: active\|sold\|withdrawn\|archived |
| Клиенты | `GET/POST /api/clients`, `PATCH …/assign` (owner_user_id), `PATCH …/convert`, `…/tags`, `…/notes` (body), `…/interactions` (type,summary). Поля: first_name,last_name,middle_name,phone,email,source,status(lead\|contact) |
| Сделки | `GET/POST /api/deals`, `GET …/board`, `GET …/stages`, `GET …/stats/funnel`, `PATCH …/{id}/stage`, `…/assign`, `…/close`. Стадии: new\|in_progress\|deal\|archived. Поля: title,amount,currency,comment,stage |
| Дела | `GET/POST /api/activities`, `…/today`, `…/upcoming`, `…/calendar`, `PATCH …/complete`, `…/reschedule` (due_at). Типы: call\|meeting\|showing\|task; статусы: planned\|done\|canceled |

Демо-данные сидов привязаны к агентству `11111111-1111-1111-1111-111111111111`.

## Структура

```
src/
  api/        — клиент по сервисам (http.js — обёртка + разбор конверта)
  stores/     — auth (сессия, JWT из data.tokens) и toast
  components/ — AppLayout, Modal, Toasts, DataState
  views/      — экраны по разделам
  lib/        — форматирование и словари
  router.js   — маршруты + guard
```
