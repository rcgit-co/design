import { http, asList, asOne } from './http.js'
const B = '/api/deals'
export const dealApi = {
  list: (query) => http('GET', B, { query }).then((d) => asList(d, 'deals')),
  get: (id) => http('GET', `${B}/${id}`).then((d) => asOne(d, 'deal')),
  create: (payload) => http('POST', B, { body: payload }).then((d) => asOne(d, 'deal')),
  update: (id, payload) => http('PUT', `${B}/${id}`, { body: payload }).then((d) => asOne(d, 'deal')),
  remove: (id) => http('DELETE', `${B}/${id}`),
  setStage: (id, stage) => http('PATCH', `${B}/${id}/stage`, { body: { stage } }).then((d) => asOne(d, 'deal')),
  assign: (id, owner_user_id) => http('PATCH', `${B}/${id}/assign`, { body: { owner_user_id } }).then((d) => asOne(d, 'deal')),
  close: (id, payload) => http('PATCH', `${B}/${id}/close`, { body: payload || {} }).then((d) => asOne(d, 'deal')),

  board: () => http('GET', `${B}/board`),
  stages: () => http('GET', `${B}/stages`).then((d) => asList(d, 'stages')),
  funnel: () => http('GET', `${B}/stats/funnel`),
  byStage: () => http('GET', `${B}/stats/by-stage`),
  history: (id) => http('GET', `${B}/${id}/history`).then((d) => asList(d, 'history')),
}
