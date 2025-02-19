import http from 'k6/http'
import { check } from 'k6'
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js'

const BASE_URL = __ENV.BASE_URL || 'https://default-url.com'
const USERNAME = __ENV.USERNAME || 'default_user'
const PASSWORD = __ENV.PASSWORD || 'default_password'

export const options = {
  vus: 100,
  stages: [
    { duration: '2s', target: 1000 },
    { duration: '2s', target: 1500 },
    { duration: '2s', target: 2000 },
    { duration: '2s', target: 2500 },
    { duration: '2s', target: 3000 },
    { duration: '2s', target: 3500 },
    { duration: '2s', target: 4000 },
    { duration: '1s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    'http_req_duration{staticAsset:yes}': ['p(99)<150'],
    'http_req_duration{staticAsset:no}': ['avg<200', 'p(95)<400'],
  },
}

export function setup() {
  const loginRes = http.post(`${BASE_URL}/auth/token/login/`, {
    username: USERNAME,
    password: PASSWORD,
  })
  const token = loginRes.json('access')
  return token
}

export default function () {
  const token = setup()
  const params_get = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  }
  const res = http.get(`${BASE_URL}/endpoint`, params_get)

  check(res, {
    'status é 200': (r) => r.status === 200,
    'tempo de resposta < 200ms': (r) => r.timings.duration < 200,
  })
}

export function handleSummary(data) {
  const htmlFile = `report/capacity_test.html`
  return {
    [htmlFile]: htmlReport(data),
    stdout: JSON.stringify(data),
  }
}
