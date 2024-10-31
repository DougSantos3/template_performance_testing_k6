/*  Um teste de resiliência é projetado para verificar a capacidade de um sistema de se recuperar de falhas e manter a 
    funcionalidade durante condições adversas. Em um teste de resiliência, além de simular uma carga de usuários, são 
    inseridas falhas controladas, como interrupções de rede, redução de recursos (como memória e CPU) e latências. 
    Esse tipo de teste é mais complexo, pois combina carga de usuários com injeção de falhas controladas para verificar 
    se o sistema consegue se recuperar e manter a performance.

    Etapas para Adicionar Resiliência
    Com K6 sozinho, você pode simular comportamentos básicos. Para adicionar falhas e injeções de erro, a prática mais
    comum seria combinar K6 com ferramentas específicas de resiliência, como Chaos Monkey, Gremlin, ou scripts de injeção 
    de falhas. Abaixo estão algumas ideias de injeções que você pode adicionar ao cenário de resiliência em paralelo:

    . Interrupção de rede: Simule falhas de rede ou latência variável para usuários específicos.
    . Limitação de recursos: Reduza intencionalmente a memória ou CPU disponível para o sistema durante o teste.
    . Falha em serviços: Desligue alguns serviços (ou containers) temporariamente e observe como o sistema lida com essas 
      interrupções.
    . Desaceleração de resposta: Aumente artificialmente o tempo de resposta dos serviços principais para ver se o sistema suporta 
      a lentidão.
    
    Essas práticas, aplicadas em conjunto com a carga constante do K6, podem fornecer insights robustos sobre como o sistema 
    reage a interrupções e se mantém resiliente. */

import http from "k6/http"
import { sleep, check } from "k6"
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js"
import { BASE_URL } from '../env/base_url.js'


export let options = {
  stages: [
    { duration: "1m", target: 500 },  // Aumenta gradualmente até 500 usuários
    { duration: "2m", target: 1000 }, // Aumenta gradualmente para 1000 usuários
    { duration: "3m", target: 1500 }, // Aumenta para 1500 usuários e mantém
    { duration: "1m", target: 1500 }, // Mantém em 1500 usuários para observar estabilidade
    { duration: "2m", target: 0 },    // Reduz para 0 usuários ao final do teste
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"], 
    "http_req_duration{staticAsset:yes}": ["p(99)<150"],
    "http_req_duration{staticAsset:no}": ["avg<200", "p(95)<400"],
  },
}

export default function () {
  let payload = JSON.stringify({ key: "value" })
  let params = { headers: { "Content-Type": "application/json" } }


  let resPut = http.put(`${BASE_URL}/endpoint/${variable}`, payload, params)
  check(resPut, {
    "PUT status é 200": (r) => r.status === 200,
    "PUT tempo de resposta < 200ms": (r) => r.timings.duration < 200,
  })
  sleep(1)
}


export function handleSummary(data) {
  const htmlFile = `report/stress_test.html`
  return {
    [htmlFile]: htmlReport(data),
    stdout: JSON.stringify(data),
  }
}
