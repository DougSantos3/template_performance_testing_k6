/*  Objetivo: Avaliar os limites e a estabilidade do sistema quando ele é submetido a uma carga insustentável.
    
    Métricas a Monitorar:
        Taxa de Erros: Para entender o momento em que o sistema começa a falhar.
        Latência de Resposta: Para ver o quanto o desempenho se deteriora sob carga extrema.
        Recuperação Pós-Falha: Observe se o sistema consegue retornar ao normal depois que o estresse termina.
        Recuperação e Resiliência: Um bom sistema não apenas lida bem com o estresse, mas também se recupera após o fim da carga.
*/

import http from 'k6/http'
import { sleep, check } from 'k6'
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js"

export let options = {
    stages: [
        { duration: '2m', target: 1000 },  // Sobe para 1000 usuários
        { duration: '2m', target: 2000 },  // Aumenta rapidamente para 2000 usuários
        { duration: '1m', target: 3000 },  // Sobe para 3000 usuários em 1 minuto
        { duration: '1m', target: 5000 },  // Sobe ainda mais rápido para 5000 usuários
        { duration: '3m', target: 7000 },  // Mantém em 7000 usuários
        { duration: '2m', target: 0 },     // Finaliza reduzindo para 0 usuários
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