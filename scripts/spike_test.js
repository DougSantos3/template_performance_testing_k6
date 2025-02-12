/* O spike test é um tipo específico de teste de performance que avalia como um sistema responde a mudanças abruptas e 
   repentinas na carga, ou seja, a picos de uso. O objetivo é verificar se o sistema consegue suportar um aumento súbito no 
   número de usuários ou requisições e se ele consegue se recuperar adequadamente quando a carga volta ao normal. Exemplos
   Jogo da copa do mundo no comercial é divulgada a marca e vai ter uma grande quantidade de acesso e quando voltar o jogo
   vai cair consideravelmente */

import http from 'k6/http'
import { check } from 'k6'
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js'
import { BASE_URL } from '../env/base_url.js'
import { SharedArray } from 'k6/data'
import papaparse from 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js'

// Carregar dados do CSV para os parâmetros
const paramsData = new SharedArray('Código de Teste', function () {
  return papaparse.parse(open('../massas/codigo.csv'), { header: true }).data
})

// Carregar dados do CSV para os e-mails
const emailsData = new SharedArray('E-mails para Teste', function () {
  return papaparse.parse(open('../massas/emails.csv'), { header: true }).data
})

export const options = {
  vus: 100,
  stages: [
    { duration: '10s', target: 0 }, // Começa com 0 usuários
    { duration: '10s', target: 3000 }, // Aumenta bruscamente para 3000 usuários em 10 segundos
    { duration: '20s', target: 3000 }, // Mantém 3000 usuários por 20 segundos
    { duration: '10s', target: 0 }, // Reduz rapidamente para 0 usuários
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% das respostas devem ser mais rápidas que 500ms
    'http_req_duration{staticAsset:yes}': ['p(99)<150'], // 99% dos ativos estáticos devem carregar em menos de 150ms
    'http_req_duration{staticAsset:no}': ['avg<200', 'p(95)<400'], // Tempo médio de resposta deve ser inferior a 200ms, 95% das respostas em menos de 400ms
  },
}

export default function () {
  // Seleciona uma massa de dados e um e-mail aleatórios
  const randomParamData =
    paramsData[Math.floor(Math.random() * paramsData.length)]
  const randomEmailData =
    emailsData[Math.floor(Math.random() * emailsData.length)]

  const param = randomParamData.param // Obtém o valor do parâmetro
  const email = randomEmailData.email // Obtém o e-mail

  // Exemplo de requisição DELETE que usa o parâmetro e o e-mail como payload
  let resDelete = http.del(
    `${BASE_URL}/endpoint/${param}`,
    JSON.stringify({ email: email }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  )

  check(resDelete, {
    'DELETE status é 204': (r) => r.status === 204,
    'DELETE tempo de resposta < 200ms': (r) => r.timings.duration < 200,
  })
}

export function handleSummary(data) {
  const htmlFile = `report/spike_test.html`
  return {
    [htmlFile]: htmlReport(data),
    stdout: JSON.stringify(data),
  }
}
