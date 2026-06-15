import { http, asList, asOne } from './http.js'
const B = '/api/clients'
export const clientApi = {
  list: (query) => http('GET', B, { query }).then((d) => asList(d, 'clients')),
  search: (query) => http('GET', `${B}/search`, { query }).then((d) => asList(d, 'clients')),
  get: (id) => http('GET', `${B}/${id}`).then((d) => asOne(d, 'client')),
  create: (payload) => http('POST', B, { body: payload }).then((d) => asOne(d, 'client')),
  update: (id, payload) => http('PUT', `${B}/${id}`, { body: payload }).then((d) => asOne(d, 'client')),
  remove: (id) => http('DELETE', `${B}/${id}`),
  assign: (id, owner_user_id) => http('PATCH', `${B}/${id}/assign`, { body: { owner_user_id } }).then((d) => asOne(d, 'client')),
  convert: (id) => http('PATCH', `${B}/${id}/convert`).then((d) => asOne(d, 'client')),

  tags: (id) => http('GET', `${B}/${id}/tags`).then((d) => asList(d, 'tags')),
  addTag: (id, tag) => http('POST', `${B}/${id}/tags`, { body: { tag } }),
  removeTag: (id, tag) => http('DELETE', `${B}/${id}/tags/${encodeURIComponent(tag)}`),

  notes: (id) => http('GET', `${B}/${id}/notes`).then((d) => asList(d, 'notes')),
  addNote: (id, body) => http('POST', `${B}/${id}/notes`, { body: { body } }),

  interactions: (id) => http('GET', `${B}/${id}/interactions`).then((d) => asList(d, 'interactions')),
  addInteraction: (id, payload) => http('POST', `${B}/${id}/interactions`, { body: payload }),
}
