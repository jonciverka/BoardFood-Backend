// Pruebas unitarias de la lógica pura de selección de semana
// (`seleccionarComidas` en src/api/tablero.js). No requieren BD.
const { test } = require('node:test');
const assert = require('node:assert/strict');

const { seleccionarComidas } = require('../src/api/tablero');

const PK_TIEMPO = 3; // tablero objetivo
const PROPIETARIO = 1;
const COLABORADOR = 2;

// Helper para construir una fila de T_COMIDA.
const comida = (pk, nombre, imagen, usuario, calif) => ({
    TCO_PK_COMIDA: pk,
    TCO_COMIDA: nombre,
    TCO_IMAGEN: imagen || 'img-default.png',
    TCO_FK_USUARIO: usuario,
    TCO_CALIFICACION: calif,
});

const baseParams = (comidas, extra = {}) => ({
    comidas,
    tiemposDeclarados: [],
    usosHistoricos: [],
    usadasPrevias: [],
    pkTiempo: PK_TIEMPO,
    pkPropietario: PROPIETARIO,
    ...extra,
});

test('selecciona 7 comidas con promedio >= 4.5 cuando las calificaciones lo permiten', () => {
    const comidas = [1, 2, 3, 4, 5, 6, 7].map(pk => comida(pk, `Comida ${pk}`, undefined, PROPIETARIO, 5));
    const r = seleccionarComidas(baseParams(comidas));

    assert.equal(r.ok, true);
    assert.equal(r.seleccion.length, 7);
    assert.ok(r.promedio >= 4.5, `promedio ${r.promedio} debería ser >= 4.5`);
});

test('acepta el caso límite promedio exactamente 4.5', () => {
    const comidas = [1, 2, 3, 4, 5, 6, 7].map(pk => comida(pk, `Comida ${pk}`, undefined, PROPIETARIO, 4.5));
    const r = seleccionarComidas(baseParams(comidas));

    assert.equal(r.ok, true);
    assert.ok(r.promedio >= 4.5);
});

test('agrupa copias del dueño y colaborador y no repite comidas dentro de la semana', () => {
    const comidas = [
        comida(1, 'Pizza', 'p.png', PROPIETARIO, 5),
        comida(2, 'Pizza', 'p.png', COLABORADOR, 5), // copia → mismo grupo
        comida(3, 'Sopa', 's.png', PROPIETARIO, 5),
        comida(4, 'Ensalada', 'e.png', PROPIETARIO, 5),
        comida(5, 'Pasta', 'p2.png', PROPIETARIO, 5),
        comida(6, 'Tacos', 't.png', PROPIETARIO, 5),
        comida(7, 'Pollo', 'c.png', PROPIETARIO, 5),
        comida(8, 'Pescado', 'p3.png', PROPIETARIO, 5),
    ];
    const r = seleccionarComidas(baseParams(comidas));

    assert.equal(r.ok, true);
    const pks = r.seleccion.map(c => c.pkComida);
    assert.equal(new Set(pks).size, 7, 'no debe repetir comidas dentro de la semana');
    // El representante del grupo "Pizza" debe ser la copia del propietario (pk 1)
    assert.ok(r.seleccion.some(c => c.nombre === 'Pizza' && c.pkComida === 1));
});

test('excluye las comidas usadas en la semana anterior cuando hay suficientes alternativas', () => {
    const comidas = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(pk => comida(pk, `Comida ${pk}`, undefined, PROPIETARIO, 5));
    const r = seleccionarComidas(baseParams(comidas, { usadasPrevias: [1, 2, 3] }));

    assert.equal(r.ok, true);
    const pks = r.seleccion.map(c => c.pkComida);
    for (const usada of [1, 2, 3]) {
        assert.ok(!pks.includes(usada), `la comida ${usada} (semana anterior) no debería repetirse`);
    }
    assert.equal(pks.length, 7);
});

test('respeta el tiempo de comida habitual: excluye comidas de otros tiempos', () => {
    const comidas = [
        ... [1, 2, 3].map(pk => comida(pk, `Otra ${pk}`, undefined, PROPIETARIO, 5)), // tiempo 5
        ... [4, 5, 6, 7, 8, 9, 10].map(pk => comida(pk, `Tiempo3 ${pk}`, undefined, PROPIETARIO, 4.6)), // tiempo 3
    ];
    const tiemposDeclarados = [
        ... [1, 2, 3].map(pk => ({ TTH_FK_COMIDA: pk, TTH_FK_TIEMPO: 5 })),
        ... [4, 5, 6, 7, 8, 9, 10].map(pk => ({ TTH_FK_COMIDA: pk, TTH_FK_TIEMPO: 3 })),
    ];
    const r = seleccionarComidas(baseParams(comidas, { tiemposDeclarados }));

    assert.equal(r.ok, true);
    const pks = r.seleccion.map(c => c.pkComida);
    assert.ok(!pks.includes(1) && !pks.includes(2) && !pks.includes(3), 'no debe usar comidas de otro tiempo');
    assert.ok(r.promedio >= 4.5);
});

test('tablero compartido: la calificación efectiva es el promedio dueño + colaborador', () => {
    const comidas = [
        comida(1, 'Ensalada', 'e.png', PROPIETARIO, 4),
        comida(2, 'Ensalada', 'e.png', COLABORADOR, 5), // misma comida → promedio 4.5
        comida(3, 'Sopa', 's.png', PROPIETARIO, 5),
        comida(4, 'Pasta', 'p2.png', PROPIETARIO, 5),
        comida(5, 'Tacos', 't.png', PROPIETARIO, 5),
        comida(6, 'Pollo', 'c.png', PROPIETARIO, 5),
        comida(7, 'Pescado', 'p3.png', PROPIETARIO, 5),
        comida(8, 'Huevos', 'h.png', PROPIETARIO, 5),
    ];
    const r = seleccionarComidas(baseParams(comidas));

    assert.equal(r.ok, true);
    const ensalada = r.seleccion.find(c => c.nombre === 'Ensalada');
    assert.ok(ensalada, 'la Ensalada debería estar en la selección');
    assert.equal(ensalada.pkComida, 1, 'el representante debe ser la copia del propietario');
    assert.equal(ensalada.calificacion, 4.5);
    assert.ok(r.promedio >= 4.5);
});

test('fallback: usa comidas sin historial cuando faltan candidatas del tiempo correcto', () => {
    const comidas = [
        ... [1, 2, 3, 4, 5].map(pk => comida(pk, `Correcta ${pk}`, undefined, PROPIETARIO, 5)), // tiempo 3
        comida(6, 'SinHistorial 1', 'sh1.png', PROPIETARIO, 5), // sin historial → fallback
        comida(7, 'SinHistorial 2', 'sh2.png', PROPIETARIO, 5), // sin historial → fallback
        ... [8, 9, 10].map(pk => comida(pk, `Otro tiempo ${pk}`, undefined, PROPIETARIO, 5)), // tiempo 5
    ];
    const tiemposDeclarados = [
        ... [1, 2, 3, 4, 5].map(pk => ({ TTH_FK_COMIDA: pk, TTH_FK_TIEMPO: 3 })),
        ... [8, 9, 10].map(pk => ({ TTH_FK_COMIDA: pk, TTH_FK_TIEMPO: 5 })),
    ];
    const r = seleccionarComidas(baseParams(comidas, { tiemposDeclarados }));

    assert.equal(r.ok, true);
    const pks = r.seleccion.map(c => c.pkComida);
    assert.ok(pks.includes(6) && pks.includes(7), 'debe entrar el fallback sin historial');
    assert.ok(!pks.includes(8) && !pks.includes(9) && !pks.includes(10), 'no debe usar comidas de otro tiempo');
    assert.equal(pks.length, 7);
});

test('relaja la exclusión de la semana anterior si eso alcanza el promedio >= 4.5', () => {
    // 7 no usadas con 4.2 (promedio estricto 4.2 < 4.5) y 3 usadas-previa con 5
    const comidas = [
        ... [1, 2, 3, 4, 5, 6, 7].map(pk => comida(pk, `No usada ${pk}`, undefined, PROPIETARIO, 4.2)),
        comida(8, 'Usada previa 1', 'u1.png', PROPIETARIO, 5),
        comida(9, 'Usada previa 2', 'u2.png', PROPIETARIO, 5),
        comida(10, 'Usada previa 3', 'u3.png', PROPIETARIO, 5),
    ];
    const r = seleccionarComidas(baseParams(comidas, { usadasPrevias: [8, 9, 10] }));

    assert.equal(r.ok, true);
    assert.ok(r.promedio >= 4.5, `promedio ${r.promedio} debería alcanzar 4.5`);
    const pks = r.seleccion.map(c => c.pkComida);
    assert.ok(pks.includes(8) && pks.includes(9) && pks.includes(10), 'debe tomar las mejor calificadas de la semana anterior');
});

test('responde SIN_SUFICIENTES cuando el pool tiene menos de 7 comidas', () => {
    const comidas = [1, 2, 3, 4, 5, 6].map(pk => comida(pk, `Comida ${pk}`, undefined, PROPIETARIO, 5));
    const r = seleccionarComidas(baseParams(comidas));

    assert.equal(r.ok, false);
    assert.equal(r.motivo, 'SIN_SUFICIENTES');
});

test('responde PROMEDIO_MINIMO cuando ninguna combinación alcanza 4.5', () => {
    const comidas = [1, 2, 3, 4, 5, 6, 7].map(pk => comida(pk, `Comida ${pk}`, undefined, PROPIETARIO, 4));
    const r = seleccionarComidas(baseParams(comidas));

    assert.equal(r.ok, false);
    assert.equal(r.motivo, 'PROMEDIO_MINIMO');
    assert.equal(r.promedio, 4);
});
