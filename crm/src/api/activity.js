import { http, asList, asOne } from './http.js'
const B = '/api/activities'
export const activityApi = {
  list: (query) => http('GET', B, { query }).then((d) => asList(d, 'activities')),
  get: (id) => http('GET', `${B}/${id}`).then((d) => asOne(d, 'activity')),
  create: (payload) => http('POST', B, { body: payload }).then((d) => asOne(d, 'activity')),
  update: (id, payload) => http('PUT', `${B}/${id}`, { body: payload }).then((d) => asOne(d, 'activity')),
  remove: (id) => http('DELETE', `${B}/${id}`),
  complete: (id) => http('PATCH', `${B}/${id}/complete`).then((d) => asOne(d, 'activity')),
  reschedule: (id, due_at) => http('PATCH', `${B}/${id}/reschedule`, { body: { due_at } }).then((d) => asOne(d, 'activity')),

  today: () => http('GET', `${B}/today`).then((d) => asList(d, 'activities')),
  upcoming: () => http('GET', `${B}/upcoming`).then((d) => asList(d, 'activities')),
  calendar: (query) => http('GET', `${B}/calendar`, { query }).then((d) => asList(d, 'activities')),
}
