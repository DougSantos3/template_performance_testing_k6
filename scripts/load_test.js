// O Load Test verifica o comportamento do sistema sob uma carga previsível de usuários.

import http from 'k6/http'
import { sleep, check } from 'k6'
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js"

export let options = {
    stages: [
        { duration: '2m', target: 1000 },  // ramp-up de 1000 usuários em 2 minutos
        { duration: '3m', target: 1000 },  // Mantém 1000 usuários por 3 minutos
        { duration: '1m', target: 0 },    // finaliza os testes reduzindo para 0 usuários
    ],
}

export default function () {
    let res = http.get('https://your-address-api.com/endpoint')
    check(res, {
        'status é 200': (r) => r.status === 200,
        'tempo de resposta < 300ms': (r) => r.timings.duration < 300,
    })
    sleep(1)
}

export function handleSummary(data) {
    const htmlFile = `report/load_test.html`
    return {
        [htmlFile]: htmlReport(data),
        stdout: JSON.stringify(data),
    }
}
