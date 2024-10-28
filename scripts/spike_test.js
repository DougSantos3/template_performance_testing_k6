import http from 'k6/http'
import { sleep, check } from 'k6'
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js"


/* Objetivo: Avaliar a estabilidade e capacidade do sistema de responder a um aumento súbito de carga e a 
recuperação quando a carga é retirada.

Métricas Importantes:
    Tempo de Resposta: Para ver como o desempenho se comporta durante o pico.
    Recuperação Pós-Pico: Avaliar se o sistema consegue retomar o desempenho normal após a carga ser reduzida.
    Erros: Monitorar possíveis falhas no início e término do pico.
 */

export let options = {
    stages: [
        { duration: '10s', target: 0 },      // Começa com 0 usuários
        { duration: '10s', target: 3000 },   // Aumenta bruscamente para 3000 usuários em 10 segundos
        { duration: '20s', target: 3000 },   // Mantém 3000 usuários por 20 segundos
        { duration: '10s', target: 0 },      // Reduz rapidamente para 0 usuários
    ],
}

export default function () {
    let res = http.get('https://your-address-api.com/endpoint')
    check(res, {
        'status é 200': (r) => r.status === 200,
        'tempo de resposta < 400ms': (r) => r.timings.duration < 400,
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

