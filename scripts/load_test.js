import http from 'k6/http'
import { sleep, check } from 'k6'

// O Load Test verifica o comportamento do sistema sob uma carga previsível de usuários.
export let options = {
    stages: [
        { duration: '2m', target: 100 },  // ramp-up de 100 usuários em 2 minutos
        { duration: '3m', target: 100 },  // Mantém 100 usuários por 3 minutos
        { duration: '1m', target: 0 },    // finaliza os testes reduzindo para 0 usuários
    ],
}

export default function () {
    let res = http.get('https://seu-endereco-api.com/endpoint')
    check(res, {
        'status é 200': (r) => r.status === 200,
        'tempo de resposta < 300ms': (r) => r.timings.duration < 300,
    })
    sleep(1)
}
