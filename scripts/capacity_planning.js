/* O teste de capacidade é projetado para verificar o número máximo de usuários ou a carga que o 
sistema pode suportar antes que ele comece a apresentar problemas de desempenho, como tempos de resposta lentos, 
aumento de erros, ou falhas. 
    
Monitoramento do Sistema: 
    Durante o teste de capacidade, observe atentamente métricas de desempenho, como uso de CPU, memória, 
    latência de resposta e taxa de erros.

    Identificação do Limite: O objetivo é identificar o ponto de saturação, onde o sistema começa a não responder 
    corretamente.
    Ajustes e Retestes: Após identificar o limite, você pode ajustar recursos do sistema e realizar novos testes de 
    capacidade para verificar a melhora.
*/

import http from 'k6/http'
import { sleep, check } from 'k6'
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js"

export let options = {
    stages: [
        { duration: '2m', target: 1000 },  // Inicializa com 1000 usuários
        { duration: '2m', target: 1500 },  // Aumenta para 1500 usuários
        { duration: '2m', target: 2000 },  // Aumenta para 2000 usuários
        { duration: '2m', target: 2500 },  // Aumenta para 2500 usuários
        { duration: '2m', target: 3000 },  // Aumenta para 3000 usuários
        { duration: '2m', target: 3500 },  // Aumenta para 3500 usuários
        { duration: '2m', target: 4000 },  // Continua aumentando conforme a capacidade observada
        { duration: '1m', target: 0 },     // Reduz para 0 usuários ao final
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
