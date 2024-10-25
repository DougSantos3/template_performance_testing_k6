import http from 'k6/http'
import { sleep, check } from 'k6'
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js"

/* O Stress Test é projetado para levar o sistema além de sua capacidade normal, verificando como ele se comporta sob alta carga. */
export let options = {
    stages: [
        { duration: '1m', target: 100 },  // Aumenta para 100 usuários
        { duration: '1m', target: 200 },  // Aumenta para 200 usuários
        { duration: '1m', target: 0 },    // Reduz para 0 usuários
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
    const htmlFile = `report/stress_test.html`
    return {
        [htmlFile]: htmlReport(data),
        stdout: JSON.stringify(data),
    }
}