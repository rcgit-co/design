import { http, asList, asOne } from './http.js'
const B = '/api/agencies'
export const agencyApi = {
  me: () => http('GET', `${B}/me`).then((d) => asOne(d, 'agency')),
  get: (id) => http('GET', `${B}/${id}`).then((d) => asOne(d, 'agency')),
  create: (payload) => http('POST', B, { body: payload }).then((d) => asOne(d, 'agency')),
  update: (id, payload) => http('PUT', `${B}/${id}`, { body: payload }).then((d) => asOne(d, 'agency')),
  lookupInn: (inn) => http('POST', `${B}/lookup-inn`, { body: { inn } }),

  getBranding: (id) => http('GET', `${B}/${id}/branding`).then((d) => asOne(d, 'branding')),
  updateBranding: (id, payload) => http('PUT', `${B}/${id}/branding`, { body: payload }).then((d) => asOne(d, 'branding')),

  contracts: (id) => http('GET', `${B}/${id}/contracts`).then((d) => asList(d, 'contracts')),
  addContract: (id, payload) => http('POST', `${B}/${id}/contracts`, { body: payload }).then((d) => asOne(d, 'contract')),
  removeContract: (id, cid) => http('DELETE', `${B}/${id}/contracts/${cid}`),
}
