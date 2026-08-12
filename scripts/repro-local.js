// Reproducción local del flujo de generarSemana con un mock de conexión y
// datos basados en el catálogo real de producción, para aislar si el fallo
// es de lógica (JS) o de integración con la BD real.
const controller = require('../src/api/tablero');

// ---- Datos mock basados en producción (catálogo de Jonathan, 19 comidas) ----
const comidas = [
    { TCO_PK_COMIDA: 1,  TCO_COMIDA: 'Pescado sinaloense',      TCO_IMAGEN: 'https://x/1.png',  TCO_FK_USUARIO: 1, TCO_CALIFICACION: '5' },
    { TCO_PK_COMIDA: 2,  TCO_COMIDA: 'Tacos placeros',          TCO_IMAGEN: 'https://x/2.png',  TCO_FK_USUARIO: 1, TCO_CALIFICACION: '5' },
    { TCO_PK_COMIDA: 3,  TCO_COMIDA: 'Pescado marinado',        TCO_IMAGEN: null,               TCO_FK_USUARIO: 1, TCO_CALIFICACION: '5' },
    { TCO_PK_COMIDA: 4,  TCO_COMIDA: 'Chiles rellenos de queso',TCO_IMAGEN: 'https://x/4.png',  TCO_FK_USUARIO: 1, TCO_CALIFICACION: '5' },
    { TCO_PK_COMIDA: 5,  TCO_COMIDA: 'Avocado toast',           TCO_IMAGEN: 'https://x/5.png',  TCO_FK_USUARIO: 1, TCO_CALIFICACION: '5' },
    { TCO_PK_COMIDA: 6,  TCO_COMIDA: 'Pizza casera',            TCO_IMAGEN: 'https://x/6.png',  TCO_FK_USUARIO: 1, TCO_CALIFICACION: '5' },
    { TCO_PK_COMIDA: 7,  TCO_COMIDA: 'Hamburguesa',             TCO_IMAGEN: 'https://x/7.png',  TCO_FK_USUARIO: 1, TCO_CALIFICACION: '5' },
    { TCO_PK_COMIDA: 8,  TCO_COMIDA: 'Sopa de fideos',          TCO_IMAGEN: 'https://x/8.png',  TCO_FK_USUARIO: 1, TCO_CALIFICACION: '4' },
    { TCO_PK_COMIDA: 9,  TCO_COMIDA: 'Ensalada César',          TCO_IMAGEN: 'https://x/9.png',  TCO_FK_USUARIO: 1, TCO_CALIFICACION: '4' },
    { TCO_PK_COMIDA: 10, TCO_COMIDA: 'Arroz con pollo',         TCO_IMAGEN: 'https://x/10.png', TCO_FK_USUARIO: 1, TCO_CALIFICACION: '4' },
    { TCO_PK_COMIDA: 11, TCO_COMIDA: 'Albóndigas',              TCO_IMAGEN: 'https://x/11.png', TCO_FK_USUARIO: 1, TCO_CALIFICACION: '4' },
    { TCO_PK_COMIDA: 12, TCO_COMIDA: 'Tacos dorados',           TCO_IMAGEN: 'https://x/12.png', TCO_FK_USUARIO: 1, TCO_CALIFICACION: '4' },
    { TCO_PK_COMIDA: 13, TCO_COMIDA: 'Chilaquiles',             TCO_IMAGEN: 'https://x/13.png', TCO_FK_USUARIO: 1, TCO_CALIFICACION: '4' },
    { TCO_PK_COMIDA: 14, TCO_COMIDA: 'Hot cakes',               TCO_IMAGEN: 'https://x/14.png', TCO_FK_USUARIO: 1, TCO_CALIFICACION: '3' },
    { TCO_PK_COMIDA: 15, TCO_COMIDA: 'Omelette',                TCO_IMAGEN: 'https://x/15.png', TCO_FK_USUARIO: 1, TCO_CALIFICACION: '3' },
    { TCO_PK_COMIDA: 16, TCO_COMIDA: 'Yogurt con granola',      TCO_IMAGEN: 'https://x/16.png', TCO_FK_USUARIO: 1, TCO_CALIFICACION: '3' },
    { TCO_PK_COMIDA: 17, TCO_COMIDA: 'Fruta picada',            TCO_IMAGEN: 'https://x/17.png', TCO_FK_USUARIO: 1, TCO_CALIFICACION: '3' },
    { TCO_PK_COMIDA: 18, TCO_COMIDA: 'Cereal con leche',        TCO_IMAGEN: 'https://x/18.png', TCO_FK_USUARIO: 1, TCO_CALIFICACION: '2' },
    { TCO_PK_COMIDA: 19, TCO_COMIDA: 'Pan dulce',               TCO_IMAGEN: 'https://x/19.png', TCO_FK_USUARIO: 1, TCO_CALIFICACION: '2' },
];

// Conexión mock: ejecuta las queries y devuelve datos según el SQL
const conn = {
    query(sql, params, cb) {
        if (sql.includes('T_USUARIOS_TIEMPO') && sql.includes('TUS_PROPIETARIO')) {
            return cb(null, [{ TUS_FK_USUARIO: 1, TUS_PROPIETARIO: 1 }, { TUS_FK_USUARIO: 3, TUS_PROPIETARIO: 0 }]);
        }
        if (sql.includes('T_COMIDA') && sql.includes('TCO_ESTADO')) {
            return cb(null, comidas);
        }
        if (sql.includes('T_TIEMPO_HAS_COMIDA')) {
            return cb(null, []); // sin tiempos declarados
        }
        if (sql.includes('COUNT(*)') && sql.includes('T_TIEMPO_COMIDA')) {
            return cb(null, []); // sin historial
        }
        if (sql.includes('SELECT DISTINCT TTC_FK_COMIDA')) {
            return cb(null, []); // nada usado en semana previa
        }
        if (sql.includes('DELETE FROM T_TIEMPO_COMIDA')) {
            return cb(null, { affectedRows: 0 });
        }
        if (sql.includes('INSERT INTO T_TIEMPO_COMIDA')) {
            return cb(null, { insertId: 999 });
        }
        console.error('QUERY SIN MOCK:', sql, params);
        return cb(new Error('Query sin mock: ' + sql));
    },
    beginTransaction(cb) { return cb(null); },
    commit(cb) { return cb(null); },
    rollback(cb) { return cb(null); },
};

const req = {
    body: { pkTiempo: 10, fechaInicio: '2026-08-10' },
    getConnection(cb) { cb(null, conn); },
};

const res = {
    status(codigo) { this.codigo = codigo; return this; },
    json(body) { this.body = body; console.log('RESPUESTA', this.codigo, JSON.stringify(body, null, 2)); },
};

(async () => {
    try {
        await controller.generarSemana(req, res);
        console.log('FIN sin excepción. código:', res.codigo);
    } catch (e) {
        console.error('EXCEPCIÓN CAPTURADA:', e.message, '\n', e.stack);
    }
})();
