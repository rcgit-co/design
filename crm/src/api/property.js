import { http, asList, asOne } from './http.js'
const B = '/api/properties'
export const propertyApi = {
  list: (query) => http('GET', B, { query }).then((d) => asList(d, 'properties')),
  search: (query) => http('GET', `${B}/search`, { query }).then((d) => asList(d, 'properties')),
  get: (id) => http('GET', `${B}/${id}`).then((d) => asOne(d, 'property')),
  create: (payload) => http('POST', B, { body: payload }).then((d) => asOne(d, 'property')),
  update: (id, payload) => http('PUT', `${B}/${id}`, { body: payload }).then((d) => asOne(d, 'property')),
  remove: (id) => http('DELETE', `${B}/${id}`),
  setStatus: (id, status) => http('PATCH', `${B}/${id}/status`, { body: { status } }).then((d) => asOne(d, 'property')),

  media: (id) => http('GET', `${B}/${id}/media`).then((d) => asList(d, 'media')),
  addMedia: (id, payload) => http('POST', `${B}/${id}/media`, { body: payload }),

  complexes: () => http('GET', `${B}/complexes`).then((d) => asList(d, 'complexes')),
  developers: () => http('GET', `${B}/developers`).then((d) => asList(d, 'developers')),
}
