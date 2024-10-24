import http from 'k6/http'
import { check, sleep } from 'k6'

export let options = {
  stages: [
    { duration: '30s', target: 10 }, // ramp-up de 10 usuários em 30 segundos
    { duration: '1m', target: 10 },  // mantém 10 usuários por 1 minuto
    { duration: '10s', target: 0 },  // finaliza os testes reduzindo para 0 usuários
  ],
}

export default function () {
  let res = http.get('https://test-api.k6.io/public/crocodiles/')
  
  check(res, {
    'status é 200': (r) => r.status === 200,
  })
  
  sleep(1)
}
