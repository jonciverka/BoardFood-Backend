// Smoke test NO destructivo del endpoint de generación de semana en
// producción. Solo valida conectividad, contrato y manejo de errores;
// NO genera una semana real (usa pkTiempo inexistente / parámetros inválidos).
//
// Uso: node scripts/smoke-generar-semana.js
const BASE = 'https://boardfood.jonathanag.com';

async function post(path, body) {
    const res = await fetch(`${BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    let json = null;
    try { json = await res.json(); } catch { /* no JSON */ }
    return { status: res.status, body: json };
}

(async () => {
    const resultados = [];

    // 1. Conectividad raíz
    try {
        const res = await fetch(`${BASE}/`);
        resultados.push({ caso: 'GET / (conectividad)', status: res.status });
    } catch (e) {
        resultados.push({ caso: 'GET / (conectividad)', error: e.message });
    }

    // 2. Sin body → espera 400
    resultados.push({ caso: 'POST sin body', ...await post('/api/comidaTablero/generar', {}) });

    // 3. fechaInicio inválida → espera 400
    resultados.push({ caso: 'POST fechaInicio inválida', ...await post('/api/comidaTablero/generar', { pkTiempo: 1, fechaInicio: '12-08-2026' }) });

    // 4. pkTiempo inexistente → espera 404 y NO debe mutar datos
    resultados.push({ caso: 'POST pkTiempo inexistente', ...await post('/api/comidaTablero/generar', { pkTiempo: 999999999, fechaInicio: '2026-08-17' }) });

    console.log(JSON.stringify(resultados, null, 2));
})();
