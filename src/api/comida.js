const https = require('https');
const http = require('http');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const urlModule = require('url');

const mysql = require('mysql2/promise'); // O el cliente que estés usando

const controller = {}

controller.crearComida = (req, res) => {
    var { nombre, imagen, pkUsuario, calificacion, notas, pksTiempo } = req.body
    var pksTiempo = pksTiempo?.split(",") ?? [];
    var date = new Date().getTime().toString();
    var nameImage = null;
    if (imagen != null && imagen != '') {
        nameImage = date + ".jpg";
        var realFile = Buffer.from(imagen, "base64");
        fs.writeFile(path.join(__dirname, '../../../boardFoodImage', nameImage), realFile, function (err) {
            if (err) {
                console.log(err);
                res.status(400).json({ mensaje: "There was a system error, please try again later.", estado: false })
                return;
            }
        });
    }
    req.getConnection((err, conn) => {
        conn.query(`INSERT INTO T_COMIDA (TCO_COMIDA, TCO_IMAGEN, TCO_FK_USUARIO, TCO_CALIFICACION, TCO_NOTAS) VALUES(?, ?, ?, ?, ?)`,
            [nombre, nameImage, pkUsuario, calificacion, notas],
            (err, resultado) => {
                if (err) res.status(400).json({ mensaje: "Hubo un error en el sistema, favor de intentarlo más tarde" })
                else {
                    for (let i = 0; i < pksTiempo.length; i++) {
                        conn.query(`INSERT INTO T_TIEMPO_HAS_COMIDA (TTH_FK_TIEMPO, TTH_FK_COMIDA) VALUES(?, ?)`,
                            [resultado.insertId, pksTiempo[i]],
                            (err, resultado) => {
                                if (err) res.status(400).json({ mensaje: "Hubo un error en el sistema, favor de intentarlo más tarde" })
                            })
                    }
                    res.status(200).json({ mensaje: "Comida creada" })
                }
            })
    })
}
controller.obtenerComidas = (req, res) => {
    var { pkUsuario } = req.query
    req.getConnection((err, conn) => {
        conn.query(`SELECT * FROM T_COMIDA WHERE TCO_FK_USUARIO = ? AND TCO_ESTADO = 1`, [pkUsuario],
            (err, resultado) => {
                if (err) res.status(400).json({ mensaje: "Hubo un error en el sistema, favor de intentarlo más tarde" })
                else {
                    res.status(200).json({ mensaje: "Comidas obtenidas", data: resultado })
                }
            })
    })
}
controller.obtenerComida = (req, res) => {
    var { pkComida } = req.query
    req.getConnection((err, conn) => {
        conn.query(` SELECT * FROM T_COMIDA WHERE TCO_PK_COMIDA = ?`, [pkComida],
            (err, resultado) => {
                if (err) res.status(400).json({ mensaje: "Hubo un error en el sistema, favor de intentarlo más tarde" })
                else {
                    res.status(200).json({ mensaje: "Comidas obtenidas", data: resultado })
                }
            })
    })
}
controller.actualizarComida = (req, res) => {
    var { pkComida, nombre, imagen, calificacion, notas, pksTiempo } = req.body
    var pksTiempo = pksTiempo?.split(",") ?? [];
    var date = new Date().getTime().toString();
    var nameImage = null;
    if (imagen != null && imagen != '') {
        nameImage = date + ".jpg";
        var realFile = Buffer.from(imagen, "base64");
        fs.writeFile(path.join(__dirname, '../../../boardFoodImage', nameImage), realFile, function (err) {
            if (err) {
                console.log(err);
                res.status(400).json({ mensaje: "There was a system error, please try again later.", estado: false })
                return;
            }
        });
    }
    req.getConnection((err, conn) => {
        conn.query(`UPDATE T_COMIDA SET TCO_COMIDA = ?, TCO_IMAGEN = COALESCE(?, TCO_IMAGEN), TCO_CALIFICACION = ?, TCO_NOTAS = ? WHERE TCO_PK_COMIDA = ?`,
            [nombre, nameImage, calificacion, notas, pkComida],
            (err, resultado) => {
                if (err) res.status(400).json({ mensaje: "Hubo un error en el sistema, favor de intentarlo más tarde" })
                else {
                    conn.query(`DELETE FROM T_TIEMPO_HAS_COMIDA WHERE TTH_FK_COMIDA = ?`, [pkComida]);
                    for (let i = 0; i < pksTiempo.length; i++) {
                        conn.query(`INSERT INTO T_TIEMPO_HAS_COMIDA (TTH_FK_TIEMPO, TTH_FK_COMIDA) VALUES(?, ?)`,
                            [pksTiempo[i], pkComida],
                            (err, resultado) => {
                                if (err) res.status(400).json({ mensaje: "Hubo un error en el sistema, favor de intentarlo más tarde" })
                            })
                    }
                    res.status(200).json({ mensaje: "Comida actualizada" })
                }
            })
    })
}
controller.eliminarComida = (req, res) => {
    var { pkComida } = req.query
    req.getConnection((err, conn) => {
        conn.query(`UPDATE T_COMIDA SET TCO_ESTADO = 0 WHERE TCO_PK_COMIDA = ?`, [pkComida],
            (err, resultado) => {
                if (err) res.status(400).json({ mensaje: "Hubo un error en el sistema, favor de intentarlo más tarde" })
                else {
                    res.status(200).json({ mensaje: "Comida eliminada" })
                }
            })
    })
}
controller.copiarComidas = (req, res) => {
    var { pksComidas, pkUsuarioDestino } = req.body;

    if (typeof pksComidas === 'string') {
        pksComidas = pksComidas.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    }

    if (!pksComidas || !Array.isArray(pksComidas) || pksComidas.length === 0 || !pkUsuarioDestino) {
        return res.status(400).json({ mensaje: "Faltan parámetros requeridos (pksComidas, pkUsuarioDestino)", estado: false });
    }

    req.getConnection((err, conn) => {
        if (err) {
            return res.status(400).json({ mensaje: "Hubo un error en la conexión a la base de datos", estado: false });
        }

        const queryAsync = (sql, params) => {
            return new Promise((resolve, reject) => {
                conn.query(sql, params, (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });
        };

        (async () => {
            try {
                let targetUserId = pkUsuarioDestino;

                // Si pkUsuarioDestino es un correo electrónico o string no numérico, buscar la PK por correo
                if (typeof pkUsuarioDestino === 'string' && (pkUsuarioDestino.includes('@') || isNaN(Number(pkUsuarioDestino)))) {
                    const users = await queryAsync(
                        `SELECT TUS_PK_USUARIO FROM T_USUARIOS WHERE TUS_CORREO = ? AND TUS_ESTADO = 1`,
                        [pkUsuarioDestino.trim()]
                    );

                    if (!users || users.length === 0) {
                        return res.status(404).json({ mensaje: `No existe ningún usuario registrado con el correo ${pkUsuarioDestino}`, estado: false });
                    }
                    targetUserId = users[0].TUS_PK_USUARIO;
                }

                const comidas = await queryAsync(
                    `SELECT * FROM T_COMIDA WHERE TCO_PK_COMIDA IN (?) AND TCO_ESTADO = 1`,
                    [pksComidas]
                );

                if (!comidas || comidas.length === 0) {
                    return res.status(404).json({ mensaje: "No se encontraron las comidas especificadas", estado: false });
                }

                for (const comida of comidas) {
                    // Se inserta la comida para el usuario destino omitiendo la calificación (TCO_CALIFICACION = NULL)
                    const resultInsert = await queryAsync(
                        `INSERT INTO T_COMIDA (TCO_COMIDA, TCO_IMAGEN, TCO_FK_USUARIO, TCO_CALIFICACION, TCO_NOTAS) VALUES (?, ?, ?, NULL, ?)`,
                        [comida.TCO_COMIDA, comida.TCO_IMAGEN, targetUserId, comida.TCO_NOTAS]
                    );

                    const nuevaPkComida = resultInsert.insertId;

                    // Copiar relaciones de tiempos de comida (T_TIEMPO_HAS_COMIDA)
                    const tiempos = await queryAsync(
                        `SELECT TTH_FK_TIEMPO FROM T_TIEMPO_HAS_COMIDA WHERE TTH_FK_COMIDA = ?`,
                        [comida.TCO_PK_COMIDA]
                    );

                    if (tiempos && tiempos.length > 0) {
                        for (const tiempo of tiempos) {
                            await queryAsync(
                                `INSERT INTO T_TIEMPO_HAS_COMIDA (TTH_FK_TIEMPO, TTH_FK_COMIDA) VALUES (?, ?)`,
                                [tiempo.TTH_FK_TIEMPO, nuevaPkComida]
                            );
                        }
                    }
                }

                res.status(200).json({ mensaje: "Comidas copiadas exitosamente", estado: true });
            } catch (error) {
                console.error("Error al copiar comidas:", error);
                res.status(400).json({ mensaje: "Hubo un error en el sistema al copiar las comidas", estado: false });
            }
        })();
    });
}

controller.crearInvitacionComida = (req, res) => {
    var { pksComidas, emailDestino, pkUsuarioOrigen } = req.body;

    let pksStr = "";
    if (Array.isArray(pksComidas)) {
        pksStr = pksComidas.join(',');
    } else if (typeof pksComidas === 'string') {
        pksStr = pksComidas.trim();
    }

    if (!pksStr || !emailDestino || !pkUsuarioOrigen) {
        return res.status(400).json({ mensaje: "Faltan parámetros requeridos (pksComidas, emailDestino, pkUsuarioOrigen)", estado: false });
    }

    req.getConnection((err, conn) => {
        if (err) return res.status(400).json({ mensaje: "Error en la conexión a la base de datos", estado: false });

        conn.query(`SELECT TUS_PK_USUARIO FROM T_USUARIOS WHERE TUS_CORREO = ? AND TUS_ESTADO = 1`, [emailDestino.trim()], (err, users) => {
            if (err) return res.status(400).json({ mensaje: "Error al consultar usuario destino", estado: false });
            if (!users || users.length === 0) {
                return res.status(404).json({ mensaje: `No existe ningún usuario registrado con el correo ${emailDestino}`, estado: false });
            }

            const targetUserId = users[0].TUS_PK_USUARIO;

            conn.query(
                `INSERT INTO T_INVITACION_COMIDA (ICO_FK_USUARIO_ORIGEN, ICO_FK_USUARIO_DESTINO, ICO_PKS_COMIDAS, ICO_ESTADO) VALUES (?, ?, ?, 0)`,
                [pkUsuarioOrigen, targetUserId, pksStr],
                (err, resultado) => {
                    if (err) {
                        console.error(err);
                        return res.status(400).json({ mensaje: "Error al enviar la invitación de comidas", estado: false });
                    }
                    res.status(200).json({ mensaje: `Invitación enviada exitosamente a ${emailDestino}`, estado: true });
                }
            );
        });
    });
};

controller.obtenerInvitacionesPendientes = (req, res) => {
    var { pkUsuario } = req.query;

    if (!pkUsuario) {
        return res.status(400).json({ mensaje: "Falta el parámetro pkUsuario", estado: false });
    }

    req.getConnection((err, conn) => {
        if (err) return res.status(400).json({ mensaje: "Error en la conexión a la base de datos", estado: false });

        const sql = `
            SELECT 
                I.ICO_PK_INVITACION,
                I.ICO_FK_USUARIO_ORIGEN,
                I.ICO_FK_USUARIO_DESTINO,
                I.ICO_PKS_COMIDAS,
                I.ICO_FECHA,
                U.TUS_USERNAME AS USERNAME_ORIGEN,
                U.TUS_CORREO AS CORREO_ORIGEN
            FROM T_INVITACION_COMIDA I
            INNER JOIN T_USUARIOS U ON I.ICO_FK_USUARIO_ORIGEN = U.TUS_PK_USUARIO
            WHERE I.ICO_FK_USUARIO_DESTINO = ? AND I.ICO_ESTADO = 0
            ORDER BY I.ICO_FECHA DESC
        `;

        conn.query(sql, [pkUsuario], (err, invitaciones) => {
            if (err) return res.status(400).json({ mensaje: "Error al obtener invitaciones pendientes", estado: false });
            res.status(200).json({ mensaje: "Invitaciones pendientes obtenidas", data: invitaciones, estado: true });
        });
    });
};

controller.responderInvitacionComida = (req, res) => {
    var { pkInvitacion, aceptar } = req.body;

    if (!pkInvitacion) {
        return res.status(400).json({ mensaje: "Falta el parámetro pkInvitacion", estado: false });
    }

    req.getConnection((err, conn) => {
        if (err) return res.status(400).json({ mensaje: "Error en la conexión a la base de datos", estado: false });

        const queryAsync = (sql, params) => {
            return new Promise((resolve, reject) => {
                conn.query(sql, params, (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });
        };

        (async () => {
            try {
                const invs = await queryAsync(`SELECT * FROM T_INVITACION_COMIDA WHERE ICO_PK_INVITACION = ? AND ICO_ESTADO = 0`, [pkInvitacion]);
                if (!invs || invs.length === 0) {
                    return res.status(404).json({ mensaje: "Invitación no encontrada o ya procesada", estado: false });
                }

                const inv = invs[0];
                const shouldAccept = aceptar === true || aceptar === 1 || aceptar === 'true';

                if (!shouldAccept) {
                    await queryAsync(`UPDATE T_INVITACION_COMIDA SET ICO_ESTADO = 2 WHERE ICO_PK_INVITACION = ?`, [pkInvitacion]);
                    return res.status(200).json({ mensaje: "Invitación rechazada", estado: true });
                }

                // Si se acepta, copiar las comidas al usuario destino
                const targetUserId = inv.ICO_FK_USUARIO_DESTINO;
                let pksComidas = inv.ICO_PKS_COMIDAS.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

                if (pksComidas.length > 0) {
                    const comidas = await queryAsync(
                        `SELECT * FROM T_COMIDA WHERE TCO_PK_COMIDA IN (?) AND TCO_ESTADO = 1`,
                        [pksComidas]
                    );

                    for (const comida of comidas) {
                        const resultInsert = await queryAsync(
                            `INSERT INTO T_COMIDA (TCO_COMIDA, TCO_IMAGEN, TCO_FK_USUARIO, TCO_CALIFICACION, TCO_NOTAS) VALUES (?, ?, ?, NULL, ?)`,
                            [comida.TCO_COMIDA, comida.TCO_IMAGEN, targetUserId, comida.TCO_NOTAS]
                        );

                        const nuevaPkComida = resultInsert.insertId;

                        const tiempos = await queryAsync(
                            `SELECT TTH_FK_TIEMPO FROM T_TIEMPO_HAS_COMIDA WHERE TTH_FK_COMIDA = ?`,
                            [comida.TCO_PK_COMIDA]
                        );

                        if (tiempos && tiempos.length > 0) {
                            for (const tiempo of tiempos) {
                                await queryAsync(
                                    `INSERT INTO T_TIEMPO_HAS_COMIDA (TTH_FK_TIEMPO, TTH_FK_COMIDA) VALUES (?, ?)`,
                                    [tiempo.TTH_FK_TIEMPO, nuevaPkComida]
                                );
                            }
                        }
                    }
                }

                await queryAsync(`UPDATE T_INVITACION_COMIDA SET ICO_ESTADO = 1 WHERE ICO_PK_INVITACION = ?`, [pkInvitacion]);
                res.status(200).json({ mensaje: "¡Comidas aceptadas e importadas exitosamente a tu catálogo!", estado: true });

            } catch (error) {
                console.error("Error al responder invitación:", error);
                res.status(400).json({ mensaje: "Hubo un error en el sistema al procesar la invitación", estado: false });
            }
        })();
    });
};

module.exports = controller;