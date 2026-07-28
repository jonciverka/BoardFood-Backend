const https = require('https');
const http = require('http');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const urlModule = require('url');

const mysql = require('mysql2/promise'); // O el cliente que estés usando

const controller = {}

controller.crearComida = (req, res) =>{
    var {nombre, imagen, pkUsuario, calificacion, notas, pksTiempo} = req.body
    var pksTiempo = pksTiempo?.split(",") ?? [];
    var date = new Date().getTime().toString();
    var nameImage = null;
    if(imagen!=null && imagen != ''){
        nameImage = date+".jpg"; 
        var realFile = Buffer.from(imagen,"base64");
        fs.writeFile(path.join(__dirname, '../../../boardFoodImage', nameImage), realFile, function(err) {
            if(err){
                console.log(err);
                res.status(400).json({mensaje:"There was a system error, please try again later.",estado: false})
                return;
            }
        });
    }
    req.getConnection((err,conn)=>{
        conn.query(`INSERT INTO T_COMIDA (TCO_COMIDA, TCO_IMAGEN, TCO_FK_USUARIO, TCO_CALIFICACION, TCO_NOTAS) VALUES(?, ?, ?, ?, ?)`,
            [nombre, nameImage, pkUsuario, calificacion, notas],
        (err, resultado)=>{
            if(err) res.status(400).json({mensaje:"Hubo un error en el sistema, favor de intentarlo más tarde"})
            else {
                for(let i = 0; i < pksTiempo.length; i++){
                    conn.query(`INSERT INTO T_TIEMPO_HAS_COMIDA (TTH_FK_TIEMPO, TTH_FK_COMIDA) VALUES(?, ?)`,
                        [resultado.insertId, pksTiempo[i]],
                    (err, resultado)=>{
                        if(err) res.status(400).json({mensaje:"Hubo un error en el sistema, favor de intentarlo más tarde"})
                    })
                }
                res.status(200).json({mensaje:"Comida creada"})
            }
        }) 
    })
}
controller.obtenerComidas = (req, res) => {
    var { pkUsuario} = req.query
    req.getConnection((err,conn)=>{
        conn.query(`SELECT * FROM T_COMIDA WHERE TCO_FK_USUARIO = ? AND TCO_ESTADO = 1`,[pkUsuario],
        (err, resultado)=>{
            if(err) res.status(400).json({mensaje:"Hubo un error en el sistema, favor de intentarlo más tarde"})
            else {
                res.status(200).json({mensaje:"Comidas obtenidas",data:resultado})
            }
        }) 
    })
}
controller.obtenerComida = (req, res) => {
    var { pkComida} = req.query
    req.getConnection((err,conn)=>{
        conn.query(` SELECT * FROM T_COMIDA WHERE TCO_PK_COMIDA = ?`,[pkComida],
        (err, resultado)=>{
            if(err) res.status(400).json({mensaje:"Hubo un error en el sistema, favor de intentarlo más tarde"})
            else {
                res.status(200).json({mensaje:"Comidas obtenidas",data:resultado})
            }
        }) 
    })
}
controller.actualizarComida = (req, res) => {
    var {pkComida, nombre, imagen, calificacion, notas, pksTiempo} = req.body
    var pksTiempo = pksTiempo?.split(",") ?? [];
    var date = new Date().getTime().toString();
    var nameImage = null;
    if(imagen!=null && imagen != ''){
        nameImage = date+".jpg"; 
        var realFile = Buffer.from(imagen,"base64");
        fs.writeFile(path.join(__dirname, '../../../boardFoodImage', nameImage), realFile, function(err) {
            if(err){
                console.log(err);
                res.status(400).json({mensaje:"There was a system error, please try again later.",estado: false})
                return;
            }
        });
    }
    req.getConnection((err,conn)=>{
        conn.query(`UPDATE T_COMIDA SET TCO_COMIDA = ?, TCO_IMAGEN = ?, TCO_CALIFICACION = ?, TCO_NOTAS = ? WHERE TCO_PK_COMIDA = ?`,
            [nombre, nameImage, calificacion, notas, pkComida],
        (err, resultado)=>{
            if(err) res.status(400).json({mensaje:"Hubo un error en el sistema, favor de intentarlo más tarde"})            
            else {
                conn.query(`DELETE FROM T_TIEMPO_HAS_COMIDA WHERE TTH_FK_COMIDA = ?`,[pkComida]);
                for(let i = 0; i < pksTiempo.length; i++){
                    conn.query(`INSERT INTO T_TIEMPO_HAS_COMIDA (TTH_FK_TIEMPO, TTH_FK_COMIDA) VALUES(?, ?)`,
                        [pksTiempo[i], pkComida],
                    (err, resultado)=>{
                        if(err) res.status(400).json({mensaje:"Hubo un error en el sistema, favor de intentarlo más tarde"})
                    })
                }
                res.status(200).json({mensaje:"Comida actualizada"})
            }
        }) 
    })
}
controller.eliminarComida = (req, res) => {
    var {pkComida} = req.query
    req.getConnection((err,conn)=>{
        conn.query(`UPDATE T_COMIDA SET TCO_ESTADO = 0 WHERE TCO_PK_COMIDA = ?`,[pkComida],
        (err, resultado)=>{
            if(err) res.status(400).json({mensaje:"Hubo un error en el sistema, favor de intentarlo más tarde"})
            else {
                res.status(200).json({mensaje:"Comida eliminada"})
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
                        [comida.TCO_COMIDA, comida.TCO_IMAGEN, pkUsuarioDestino, comida.TCO_NOTAS]
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
module.exports = controller;