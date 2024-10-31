/* Objetivo: Avaliar a estabilidade e capacidade do sistema de responder a um aumento súbito de carga e a 
recuperação quando a carga é retirada.

Métricas Importantes:
    Tempo de Resposta: Para ver como o desempenho se comporta durante o pico.
    Recuperação Pós-Pico: Avaliar se o sistema consegue retomar o desempenho normal após a carga ser reduzida.
    Erros: Monitorar possíveis falhas no início e término do pico. */

import http from "k6/http"
import { sleep, check } from "k6"
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js"
import { BASE_URL } from '../env/base_url.js'


export let options = {
  vus: 100,
  stages: [
    { duration: "10s", target: 0 }, // Começa com 0 usuários
    { duration: "10s", target: 3000 }, // Aumenta bruscamente para 3000 usuários em 10 segundos
    { duration: "20s", target: 3000 }, // Mantém 3000 usuários por 20 segundos
    { duration: "10s", target: 0 }, // Reduz rapidamente para 0 usuários
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% das respostas devem ser mais rápidas que 500ms
    "http_req_duration{staticAsset:yes}": ["p(99)<150"], // 99% dos ativos estáticos devem carregar em menos de 150ms
    "http_req_duration{staticAsset:no}": ["avg<200", "p(95)<400"], // Tempo médio de resposta deve ser inferior a 200ms, 95% das respostas em menos de 400ms
  },
}

export default function () {
  let resDelete = http.del(`${BASE_URL}/endpoint/${param}`)
  check(resDelete, {
    "DELETE status é 204": (r) => r.status === 204,
    "DELETE tempo de resposta < 200ms": (r) => r.timings.duration < 200,
  })

  sleep(1)
}

export function handleSummary(data) {
  const htmlFile = `report/spike_test.html`

  return {
    [htmlFile]: htmlReport(data),
    stdout: JSON.stringify(data),
  }
}
