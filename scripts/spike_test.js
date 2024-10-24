import http from 'k6/http'
import { sleep, check } from 'k6'

/* O spike test simula um aumento repentino de carga para ver como o sistema responde a picos temporários. */
export let options = {
    stages: [
        { duration: '10s', target: 50 },   // Aumenta para 50 usuários
        { duration: '10s', target: 200 },  // Aumenta rapidamente para 200 usuários
        { duration: '10s', target: 0 },    // Reduz para 0 usuários
    ],
}

export default function () {
    let res = http.get('https://seu-endereco-api.com/endpoint')
    check(res, {
        'status é 200': (r) => r.status === 200,
        'tempo de resposta < 400ms': (r) => r.timings.duration < 400,
    })
    sleep(1)
}
