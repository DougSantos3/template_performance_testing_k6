import http from 'k6/http'
import { sleep, check } from 'k6'
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js"

// Teste de capacidade verifica como o sistema se comporta sob uma carga constante de usuários ao longo de um período prolongado.
export let options = {
    stages: [
        { duration: '1m', target: 50 },  // Aumenta para 50 usuários
        { duration: '5m', target: 50 },  // Mantém 50 usuários constantes
        { duration: '1m', target: 0 },   // Reduz para 0 usuários
    ],
}

export default function () {
    let res = http.get('https://your-address-api.com/endpoint')
    check(res, {
        'status é 200': (r) => r.status === 200,
        'tempo de resposta < 200ms': (r) => r.timings.duration < 200,
    })
    sleep(1)
}

export function handleSummary(data) {
    const htmlFile = `report/capacity_test.html`
    return {
        [htmlFile]: htmlReport(data),
        stdout: JSON.stringify(data), 
    }
}
