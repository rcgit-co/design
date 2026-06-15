import { http, asOne, asList } from './http.js'

// Сервис auth — маршрутизация шлюзом по умолчанию (всё, кроме /api/{profile,agencies,...}).
export const authApi = {
  register: (payload) => http('POST', '/api/register', { body: payload, auth: false }),
  login: (payload) => http('POST', '/api/login', { body: payload, auth: false }),
  refresh: (refresh_token) => http('POST', '/api/refresh', { body: { refresh_token }, auth: false }),
  logout: () => http('POST', '/api/logout'),
  me: () => http('GET', '/api/me').then((d) => asOne(d, 'user')),
  employees: () => http('GET', '/api/company/employees').then((d) => asList(d, 'employees', 'users')),
  checkEmail: (email) => http('POST', '/api/check-email', { body: { email }, auth: false }),
  checkInn: (inn) => http('POST', '/api/check-inn', { body: { inn }, auth: false }),
  checkLogin: (login) => http('POST', '/api/check-login', { body: { login }, auth: false }),
}
