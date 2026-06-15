import { http, asList, asOne } from './http.js'
const B = '/api/profile'
export const profileApi = {
  me: () => http('GET', `${B}/profile/me`).then((d) => asOne(d, 'user', 'profile')),
  permissions: () => http('GET', `${B}/profile/me/permissions`).then((d) => asOne(d, 'permissions')),
  updateMe: (payload) => http('PUT', `${B}/profile/me`, { body: payload }).then((d) => asOne(d, 'user')),

  statsTotal: () => http('GET', `${B}/stats/total`),
  statsByRole: () => http('GET', `${B}/stats/by-role`),

  list: (query) => http('GET', `${B}/users`, { query }).then((d) => asList(d, 'users')),
  get: (id) => http('GET', `${B}/users/${id}`).then((d) => asOne(d, 'user')),
  create: (payload) => http('POST', `${B}/users`, { body: payload }).then((d) => asOne(d, 'user')),
  update: (id, payload) => http('PUT', `${B}/users/${id}`, { body: payload }).then((d) => asOne(d, 'user')),
  remove: (id) => http('DELETE', `${B}/users/${id}`),
  changeRole: (id, role, reason) => http('PATCH', `${B}/users/${id}/role`, { body: { role, reason } }).then((d) => asOne(d, 'user')),
  activate: (id) => http('PATCH', `${B}/users/${id}/activate`).then((d) => asOne(d, 'user')),
  deactivate: (id) => http('PATCH', `${B}/users/${id}/deactivate`).then((d) => asOne(d, 'user')),
}
