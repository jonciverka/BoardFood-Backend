const https = require('https');
const http = require('http');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const urlModule = require('url');

const mysql = require('mysql2/promise'); // O el cliente que estés usando

const controller = {}
controller.crearTablero = (req, res) => {
    var { nombre, pkUsuario } = req.body
    req.getConnection((err, conn) => {
        conn.query(` INSERT INTO C_TIEMPOS (CTI_TIEMPO, CTI_ESTADO) VALUES(?, 1)`, [nombre],
            (err, resultado) => {
                if (err) res.status(400).json({ mensaje: "Hubo un error en el sistema, favor de intentarlo más tarde" })
                else {
                    conn.query(`INSERT INTO T_USUARIOS_TIEMPO (TUS_PROPIETARIO, TUS_FK_USUARIO, TUS_FK_TIEMPO) VALUES(?, ? , ?)`, [1, pkUsuario, resultado.insertId])
                    res.status(200).json({ mensaje: "Tablero creado" })
                }
            })
    })
}
controller.obtenerTableros = (req, res) => {
    var { pkUsuario } = req.query
    req.getConnection((err, conn) => {
        conn.query(`
            SELECT 
                CTI_TIEMPO,
                CTI_PK_TIEMPO,
                CTI_ORDEN,
                TCO_PK_COMIDA,
                TCO_COMIDA,
                TCO_IMAGEN,
                TCO_CALIFICACION,
                TCO_NOTAS,
                TTC_DIA,
                TUS_PROPIETARIO AS PROPIETARIO,
				(
                    SELECT GROUP_CONCAT(TUS_USERNAME SEPARATOR ', ') 
                    FROM T_USUARIOS
                    INNER JOIN T_USUARIOS_TIEMPO ON TUS_FK_USUARIO = TUS_PK_USUARIO 
                    WHERE TUS_FK_TIEMPO = CTI_PK_TIEMPO 
                    AND TUS_ESTADO = 1
                ) AS USUARIOS 
            FROM T_USUARIOS_TIEMPO 
            INNER JOIN C_TIEMPOS ON TUS_FK_TIEMPO = CTI_PK_TIEMPO AND CTI_ESTADO = 1
            LEFT JOIN T_TIEMPO_COMIDA ON CTI_PK_TIEMPO = TTC_FK_TIMEPO 
            LEFT JOIN T_COMIDA ON TTC_FK_COMIDA = TCO_PK_COMIDA AND TCO_ESTADO = 1
            INNER JOIN T_USUARIOS ON TUS_FK_USUARIO = TUS_PK_USUARIO
            WHERE TUS_FK_USUARIO = ?
            GROUP BY CTI_TIEMPO,
                CTI_PK_TIEMPO,
                CTI_ORDEN,
                TCO_PK_COMIDA,
                TCO_COMIDA,
                TCO_IMAGEN,
                TCO_CALIFICACION,
                TCO_NOTAS,
                TTC_DIA,
                TUS_PROPIETARIO
                
            `, [pkUsuario],
            (err, resultado) => {
                if (err) {
                    console.log(err)
                    res.status(400).json({ mensaje: "Hubo un error en el sistema, favor de intentarlo más tarde" })
                }
                else {
                    res.status(200).json({ mensaje: "Tableros obtenidos", data: resultado })
                }
            })
    })
}
controller.actualizarTablero = (req, res) => {
    var { pkTiempo, orden, tiempo } = req.body
    req.getConnection((err, conn) => {
        conn.query(`UPDATE C_TIEMPOS SET CTI_ORDEN = ?, CTI_TIEMPO = ? WHERE CTI_PK_TIEMPO = ?`, [orden, tiempo, pkTiempo],
            (err, resultado) => {
                if (err) res.status(400).json({ mensaje: "Hubo un error en el sistema, favor de intentarlo más tarde" })
                else {
                    res.status(200).json({ mensaje: "Tablero actualizado" })
                }
            })
    })
}
controller.eliminarTablero = (req, res) => {
    var { pkTiempo } = req.query
    req.getConnection((err, conn) => {
        conn.query(`UPDATE C_TIEMPOS SET CTI_ESTADO = 0 WHERE CTI_PK_TIEMPO = ?`, [pkTiempo],
            (err, resultado) => {
                if (err) res.status(400).json({ mensaje: "Hubo un error en el sistema, favor de intentarlo más tarde" })
                else {
                    res.status(200).json({ mensaje: "Tablero eliminado" })
                }
            })
    })
}
controller.agregarUsuarioTablero = (req, res) => {
    var { pkTiempo, pkUsuario } = req.body
    req.getConnection((err, conn) => {
        conn.query(`INSERT INTO T_USUARIOS_TIEMPO (TUS_PROPIETARIO, TUS_FK_USUARIO, TUS_FK_TIEMPO) VALUES(?, ? , ?)`, [0, pkUsuario, pkTiempo],
            (err, resultado) => {
                if (err) res.status(400).json({ mensaje: "Hubo un error en el sistema, favor de intentarlo más tarde" })
                else {
                    res.status(200).json({ mensaje: "Usuario agregado al tablero" })
                }
            })
    })
}
controller.obtenerUsuarioTablero = (req, res) => {
    var { pkTiempo } = req.query
    req.getConnection((err, conn) => {
        conn.query(`SELECT 
            TUS_USERNAME, 
            TUS_PK_USUARIO,
            TUS_CORREO,
            TUT.TUS_PROPIETARIO
            FROM T_USUARIOS_TIEMPO AS TUT, T_USUARIOS WHERE TUT.TUS_FK_TIEMPO = ? and TUT.TUS_FK_USUARIO = TUS_PK_USUARIO AND TUS_ESTADO = 1`, [pkTiempo],
            (err, resultado) => {
                if (err) res.status(400).json({ mensaje: "Hubo un error en el sistema, favor de intentarlo más tarde" })
                else {
                    res.status(200).json({ mensaje: "Usuarios obtenidos", data: resultado })
                }
            })
    })
}
controller.eliminarUsuarioTablero = (req, res) => {
    var { pkTiempo, pkUsuario } = req.query
    req.getConnection((err, conn) => {
        conn.query(`DELETE FROM T_USUARIOS_TIEMPO WHERE TUS_FK_USUARIO = ? AND TUS_FK_TIEMPO = ?`, [pkUsuario, pkTiempo],
            (err, resultado) => {
                if (err) res.status(400).json({ mensaje: "Hubo un error en el sistema, favor de intentarlo más tarde" })
                else {
                    res.status(200).json({ mensaje: " Usuario eliminado del tablero" })
                }
            })
    })
}
controller.guardarComidaTablero = (req, res) => {
    var { pkTiempo, pkComida, dia } = req.body
    req.getConnection((err, conn) => {
        conn.query(`INSERT INTO T_TIEMPO_COMIDA (TTC_FK_TIMEPO, TTC_FK_COMIDA, TTC_DIA) VALUES(?, ? ,?)`, [pkTiempo, pkComida, dia],
            (err, resultado) => {
                if (err) res.status(400).json({ mensaje: "Hubo un error en el sistema, favor de intentarlo más tarde" })
                else {
                    res.status(200).json({ mensaje: "Comida agregada al tablero" })
                }
            })
    })
}
controller.eliminarComidaTablero = (req, res) => {
    var { pkTiempo, pkComida } = req.query
    req.getConnection((err, conn) => {
        conn.query(`DELETE FROM T_TIEMPO_COMIDA WHERE TTC_FK_TIMEPO = ? AND TTC_FK_COMIDA = ?`, [pkTiempo, pkComida],
            (err, resultado) => {
                if (err) res.status(400).json({ mensaje: "Hubo un error en el sistema, favor de intentarlo más tarde" })
                else {
                    res.status(200).json({ mensaje: "Comida eliminada del tablero" })
                }
            })
    })
}

/**
 * Lógica pura de selección de una semana (sin acceso a BD) para poder
 * probarse de forma unitaria.
 *
 * Parámetros:
 * - comidas: filas de T_COMIDA (TCO_PK_COMIDA, TCO_COMIDA, TCO_IMAGEN,
 *   TCO_FK_USUARIO, TCO_CALIFICACION).
 * - tiemposDeclarados: filas de T_TIEMPO_HAS_COMIDA (TTH_FK_COMIDA,
 *   TTH_FK_TIEMPO).
 * - usosHistoricos: agregaciones de T_TIEMPO_COMIDA {TTC_FK_COMIDA,
 *   TTC_FK_TIMEPO, veces}.
 * - usadasPrevias: Set/array de TCO_PK_COMIDA usadas en los 7 días previos.
 * - pkTiempo: tablero objetivo (número).
 * - pkPropietario: dueño del tablero (número).
 *
 * Retorna { ok: true, seleccion, promedio } o { ok: false, motivo, promedio }
 * con motivo 'SIN_SUFICIENTES' | 'PROMEDIO_MINIMO'.
 */
function seleccionarComidas({ comidas, tiemposDeclarados, usosHistoricos, usadasPrevias, pkTiempo, pkPropietario }) {
    const usadasPreviasSet = new Set(usadasPrevias);

    // Agrupar copias de la misma comida (nombre + imagen) para promediar calificaciones
    const grupos = new Map();
    for (const comida of comidas) {
        const key = `${(comida.TCO_COMIDA || '').trim().toLowerCase()}|${comida.TCO_IMAGEN || ''}`;
        if (!grupos.has(key)) grupos.set(key, { comidas: [], nombre: comida.TCO_COMIDA });
        grupos.get(key).comidas.push(comida);
    }

    // Construir candidatas con calificación efectiva y tiempo habitual
    const candidatas = [];
    for (const grupo of grupos.values()) {
        const pks = grupo.comidas.map(c => c.TCO_PK_COMIDA);

        // Calificación efectiva: promedio de calificaciones del catálogo (dueño + colaboradores)
        const calificaciones = grupo.comidas
            .map(c => c.TCO_CALIFICACION)
            .filter(c => c != null && !isNaN(Number(c)))
            .map(Number);
        const calificacion = calificaciones.length > 0
            ? calificaciones.reduce((a, b) => a + b, 0) / calificaciones.length
            : null;

        // Representante: copia del propietario si existe; si no, la primera
        const representante = grupo.comidas.find(c => c.TCO_FK_USUARIO === pkPropietario) || grupo.comidas[0];

        // Tiempo habitual: declarado en T_TIEMPO_HAS_COMIDA o usado históricamente
        const declarados = new Set(
            tiemposDeclarados.filter(t => pks.includes(t.TTH_FK_COMIDA)).map(t => t.TTH_FK_TIEMPO)
        );
        const tiemposUsados = new Map();
        for (const u of usosHistoricos.filter(x => pks.includes(x.TTC_FK_COMIDA))) {
            tiemposUsados.set(u.TTC_FK_TIMEPO, (tiemposUsados.get(u.TTC_FK_TIMEPO) || 0) + u.veces);
        }
        const tiempoHabitual = declarados.size > 0 ? [...declarados] : [...tiemposUsados.keys()];
        const sinHistorial = declarados.size === 0 && tiemposUsados.size === 0;

        candidatas.push({
            pkComida: representante.TCO_PK_COMIDA,
            nombre: grupo.nombre,
            calificacion,
            usadoPrevio: pks.some(pk => usadasPreviasSet.has(pk)),
            corresponde: tiempoHabitual.includes(Number(pkTiempo)),
            sinHistorial,
        });
    }

    const calcularPromedio = (sel) =>
        sel.reduce((acc, c) => acc + (c.calificacion == null ? 0 : c.calificacion), 0) / 7;

    if (candidatas.length < 7) {
        return { ok: false, motivo: 'SIN_SUFICIENTES', promedio: null };
    }

    // Orden preferente: no usada la semana anterior → respeta tiempo habitual →
    // sin historial (fallback) → mejor calificación.
    const orden = (c) => [
        c.usadoPrevio ? 0 : 1,
        c.corresponde ? 1 : 0,
        c.sinHistorial ? 1 : 0,
        c.calificacion == null ? -1 : c.calificacion,
    ];
    const comparar = (a, b) => {
        const oa = orden(a), ob = orden(b);
        for (let i = 0; i < oa.length; i++) {
            if (oa[i] !== ob[i]) return ob[i] - oa[i];
        }
        return 0;
    };

    let seleccion = [...candidatas].sort(comparar).slice(0, 7);
    let promedio = calcularPromedio(seleccion);

    // Si con las reglas estrictas no se alcanza 4.5, se relaja únicamente la
    // exclusión de la semana anterior (priorizando la calificación).
    if (promedio < 4.5) {
        const ordenPorCalificacion = (c) => [
            c.corresponde ? 1 : 0,
            c.sinHistorial ? 1 : 0,
            c.calificacion == null ? -1 : c.calificacion,
        ];
        const relajadas = [...candidatas].sort((a, b) => {
            const oa = ordenPorCalificacion(a), ob = ordenPorCalificacion(b);
            for (let i = 0; i < oa.length; i++) {
                if (oa[i] !== ob[i]) return ob[i] - oa[i];
            }
            return 0;
        }).slice(0, 7);
        const promedioRelajado = calcularPromedio(relajadas);
        if (promedioRelajado > promedio) {
            seleccion = relajadas;
            promedio = promedioRelajado;
        }
    }

    // Garantía final del objetivo promedio ≥ 4.5: si ni siquiera las 7 mejores
    // calificaciones lo alcanzan, ninguna combinación podrá → error explícito
    // (el controlador no persiste nada en ese caso).
    if (promedio < 4.5) {
        const mejores = [...candidatas].sort((a, b) => {
            const ca = a.calificacion == null ? -1 : a.calificacion;
            const cb = b.calificacion == null ? -1 : b.calificacion;
            return cb - ca;
        }).slice(0, 7);
        const promedioMejores = calcularPromedio(mejores);
        if (promedioMejores >= 4.5) {
            seleccion = mejores;
            promedio = promedioMejores;
        } else {
            return { ok: false, motivo: 'PROMEDIO_MINIMO', promedio: promedioMejores };
        }
    }

    return { ok: true, seleccion, promedio };
}

/**
 * Genera una semana aleatoria de comidas para un tablero (tiempo de comida).
 *
 * Reglas:
 * - Pool = comidas del dueño + copias de los colaboradores del tablero.
 * - Calificación efectiva por comida = promedio de las calificaciones del
 *   catálogo (dueño + colaboradores) de la misma comida.
 * - Excluye comidas usadas en los 7 días previos a `fechaInicio`.
 * - No repite comidas dentro de la semana generada.
 * - Respeta el tiempo de comida habitual (tiempos declarados en
 *   T_TIEMPO_HAS_COMIDA o tiempos usados históricamente en T_TIEMPO_COMIDA);
 *   con fallback a comidas sin historial si no hay suficientes candidatas.
 * - Prioriza comidas con mejor calificación (objetivo promedio ≥ 4.5). Si no
 *   existe una combinación que alcance el objetivo, responde 422 sin modificar
 *   la semana.
 * - Persiste (reemplaza) las 7 asignaciones de la semana objetivo de forma
 *   transaccional (rollback ante cualquier fallo).
 */
controller.generarSemana = (req, res) => {
    var { pkTiempo, fechaInicio } = req.body;

    if (!pkTiempo || !fechaInicio) {
        return res.status(400).json({ mensaje: "Faltan parámetros requeridos (pkTiempo, fechaInicio)", estado: false });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaInicio)) {
        return res.status(400).json({ mensaje: "fechaInicio debe tener formato yyyy-MM-dd", estado: false });
    }

    req.getConnection((err, conn) => {
        if (err) return res.status(400).json({ mensaje: "Error en la conexión a la base de datos", estado: false });

        const queryAsync = (sql, params) => new Promise((resolve, reject) => {
            conn.query(sql, params, (err, results) => err ? reject(err) : resolve(results));
        });

        const addDays = (dateStr, days) => {
            const [y, m, d] = dateStr.split('-').map(Number);
            const date = new Date(Date.UTC(y, m - 1, d + days));
            return date.toISOString().slice(0, 10);
        };

        (async () => {
            try {
                // 1) Usuarios del tablero (dueño + colaboradores)
                const usuariosTablero = await queryAsync(
                    `SELECT TUS_FK_USUARIO, TUS_PROPIETARIO FROM T_USUARIOS_TIEMPO WHERE TUS_FK_TIEMPO = ?`,
                    [pkTiempo]
                );
                if (!usuariosTablero || usuariosTablero.length === 0) {
                    return res.status(404).json({ mensaje: "El tablero no existe o no tiene usuarios", estado: false });
                }
                const pksUsuarios = usuariosTablero.map(u => u.TUS_FK_USUARIO);
                const pkPropietario = (usuariosTablero.find(u => u.TUS_PROPIETARIO == 1) || {}).TUS_FK_USUARIO || pksUsuarios[0];

                // 2) Pool de comidas: catálogo del dueño + colaboradores
                const comidas = await queryAsync(
                    `SELECT TCO_PK_COMIDA, TCO_COMIDA, TCO_IMAGEN, TCO_FK_USUARIO, TCO_CALIFICACION
                     FROM T_COMIDA
                     WHERE TCO_FK_USUARIO IN (?) AND TCO_ESTADO = 1`,
                    [pksUsuarios]
                );

                if (!comidas || comidas.length === 0) {
                    return res.status(404).json({ mensaje: "No hay comidas disponibles para generar la semana", estado: false });
                }

                const pksComidas = comidas.map(c => c.TCO_PK_COMIDA);

                // 3) Tiempos declarados (T_TIEMPO_HAS_COMIDA) y tiempos usados históricamente (T_TIEMPO_COMIDA)
                const [tiemposDeclarados, usosHistoricos] = await Promise.all([
                    queryAsync(
                        `SELECT TTH_FK_COMIDA, TTH_FK_TIEMPO FROM T_TIEMPO_HAS_COMIDA WHERE TTH_FK_COMIDA IN (?)`,
                        [pksComidas]
                    ),
                    queryAsync(
                        `SELECT TTC_FK_COMIDA, TTC_FK_TIMEPO, COUNT(*) AS veces
                         FROM T_TIEMPO_COMIDA
                         WHERE TTC_FK_COMIDA IN (?)
                         GROUP BY TTC_FK_COMIDA, TTC_FK_TIMEPO`,
                        [pksComidas]
                    )
                ]);

                // 5) Usadas en los 7 días previos a fechaInicio (mismo tablero)
                const fechaInicioPrev = addDays(fechaInicio, -7);
                const usadasPrevias = await queryAsync(
                    `SELECT DISTINCT TTC_FK_COMIDA
                     FROM T_TIEMPO_COMIDA
                     WHERE TTC_FK_TIMEPO = ? AND TTC_DIA >= ? AND TTC_DIA < ?`,
                    [pkTiempo, fechaInicioPrev, fechaInicio]
                );
                const pksUsadasPrevias = new Set(usadasPrevias.map(r => r.TTC_FK_COMIDA));

                // 6) Seleccionar 7 comidas (reglas + objetivo promedio ≥ 4.5).
                const resultado = seleccionarComidas({
                    comidas,
                    tiemposDeclarados,
                    usosHistoricos,
                    usadasPrevias: pksUsadasPrevias,
                    pkTiempo: Number(pkTiempo),
                    pkPropietario,
                });

                if (!resultado.ok) {
                    if (resultado.motivo === 'SIN_SUFICIENTES') {
                        return res.status(400).json({ mensaje: "No hay suficientes comidas disponibles para completar la semana (se necesitan 7)", estado: false });
                    }
                    return res.status(422).json({
                        mensaje: `No se pudo generar una semana con promedio >= 4.5 con las comidas disponibles (promedio alcanzable: ${resultado.promedio.toFixed(2)}). Agrega comidas mejor calificadas o califica tus comidas.`,
                        estado: false,
                        promedio: resultado.promedio,
                    });
                }

                // 7) Persistir (transaccional): reemplazar la semana objetivo y
                //    guardar las 7 asignaciones. Un fallo revierte todo el cambio
                //    para no dejar la semana parcialmente escrita.
                const fechaFin = addDays(fechaInicio, 6);
                const beginTx = () => new Promise((resolve, reject) => conn.beginTransaction(e => e ? reject(e) : resolve()));
                const commitTx = () => new Promise((resolve, reject) => conn.commit(e => e ? reject(e) : resolve()));
                const rollbackTx = () => new Promise((resolve, reject) => conn.rollback(e => e ? reject(e) : resolve()));

                await beginTx();
                try {
                    await queryAsync(
                        `DELETE FROM T_TIEMPO_COMIDA WHERE TTC_FK_TIMEPO = ? AND TTC_DIA >= ? AND TTC_DIA <= ?`,
                        [pkTiempo, fechaInicio, fechaFin]
                    );

                    const data = [];
                    for (let i = 0; i < 7; i++) {
                        const dia = addDays(fechaInicio, i);
                        const comida = resultado.seleccion[i];
                        await queryAsync(
                            `INSERT INTO T_TIEMPO_COMIDA (TTC_FK_TIMEPO, TTC_FK_COMIDA, TTC_DIA) VALUES (?, ?, ?)`,
                            [pkTiempo, comida.pkComida, dia]
                        );
                        data.push({ pkComida: comida.pkComida, dia, calificacion: comida.calificacion });
                    }
                    await commitTx();
                } catch (txError) {
                    await rollbackTx();
                    throw txError;
                }

                res.status(200).json({ mensaje: "Semana generada exitosamente", promedio: resultado.promedio, data });
            } catch (error) {
                console.error("Error al generar semana:", error);
                res.status(400).json({ mensaje: "Hubo un error en el sistema al generar la semana", estado: false });
            }
        })();
    });
};

module.exports = controller;
// Exportación adicional de la lógica pura para pruebas unitarias.
module.exports.seleccionarComidas = seleccionarComidas;