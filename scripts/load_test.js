/* Um load test (ou teste de carga) é um tipo de teste de performance que mede como uma aplicação ou sistema responde sob uma 
   quantidade específica de carga ou número de usuários simultâneos. Esse teste simula situações reais para verificar como o sistema
   lida com o uso normal e com picos de acesso, ajudando a identificar possíveis gargalos e o ponto em que a aplicação começa a
   desacelerar ou a falhar. */

import http from 'k6/http'
import { check } from 'k6'
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js'
import { BASE_URL } from '../env/base_url.js'

export const options = {
  stages: [
    { duration: '2m', target: 500 }, // Aumenta gradualmente para 500 usuários em 2 minutos
    { duration: '3m', target: 1000 }, // Aumenta gradualmente para 1000 usuários
    { duration: '5m', target: 2000 }, // Mantém 2000 usuários por 5 minutos
    { duration: '2m', target: 2000 }, // Mantém os 2000 usuários para observar estabilidade
    { duration: '1m', target: 0 }, // Reduz para 0 ao final do teste
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% das respostas devem ser mais rápidas que 500ms
    'http_req_duration{staticAsset:yes}': ['p(99)<150'], // 99% dos ativos estáticos devem carregar em menos de 150ms
    'http_req_duration{staticAsset:no}': ['avg<200', 'p(95)<400'], // Tempo médio de resposta deve ser inferior a 200ms, 95% das respostas em menos de 400ms
  },
}

export default function () {
  let payload = JSON.stringify({ key: 'value' })
  let params_post = { headers: { 'Content-Type': 'application/json' } }

  let resPost = http.post(`${BASE_URL}/endpoint`, payload, params_post)
  check(resPost, {
    'POST status é 201': (r) => r.status === 201,
    'POST tempo de resposta < 200ms': (r) => r.timings.duration < 200,
  })
}

export function handleSummary(data) {
  const htmlFile = `report/load_test.html`
  return {
    [htmlFile]: htmlReport(data),
    stdout: JSON.stringify(data),
  }
}
