const https = require('https');
const http = require('http');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const urlModule = require('url');

const mysql = require('mysql2/promise'); // O el cliente que estés usando

const controller = {}
controller.crearTablero = (req, res) =>{
     var {nombre, pkUsuario} = req.body
    req.getConnection((err,conn)=>{
        conn.query(` INSERT INTO C_TIEMPOS (CTI_TIEMPO) VALUES(?)`,[nombre],
        (err, resultado)=>{
            if(err) res.status(400).json({mensaje:"Hubo un error en el sistema, favor de intentarlo más tarde"})
            else {
                conn.query(`INSERT INTO T_USUARIOS_TIEMPO (TUS_PROPIETARIO, TUS_FK_USUARIO, TUS_FK_TIEMPO) VALUES(?, ? , ?)`,[1, pkUsuario, resultado.insertId])
                res.status(200).json({mensaje:"Tablero creado"})
            }
        }) 
    })
}
controller.obtenerTableros = (req, res) => {
    var {pkUsuario} = req.query
    req.getConnection((err,conn)=>{
        conn.query(`
           SELECT 
                CTI_TIEMPO,
                CTI_PK_TIEMPO,
                CTI_ORDEN,
                TCO_COMIDA,
                TCO_IMAGEN,
                TCO_CALIFICACION,
                TCO_NOTAS,
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
            LEFT JOIN T_COMIDA ON TTC_FK_COMIDA = TCO_PK_COMIDA  AND TCO_ESTADO = 1
            WHERE TUS_FK_USUARIO = ?
            GROUP BY CCTI_TIEMPO,
                CTI_PK_TIEMPO,
                CTI_ORDEN,
                TCO_COMIDA,
                TCO_IMAGEN,
                TCO_CALIFICACION,
                TCO_NOTAS,
                USUARIOS
           
            `,[ pkUsuario],
        (err, resultado)=>{
            if(err) {
                console.log(err)
                res.status(400).json({mensaje:"Hubo un error en el sistema, favor de intentarlo más tarde"})
            }
            else {
                res.status(200).json({mensaje:"Tableros obtenidos",data:resultado})
            }
        }) 
    })
}
controller.actualizarTablero = (req, res) => {
    var {pkTiempo, orden, tiempo} = req.body
    req.getConnection((err,conn)=>{
        conn.query(`UPDATE C_TIEMPOS SET CTI_ORDEN = ?, CTI_TIEMPO = ? WHERE CTI_PK_TIEMPO = ?`, [orden, tiempo, pkTiempo],
        (err, resultado)=>{
            if(err) res.status(400).json({mensaje:"Hubo un error en el sistema, favor de intentarlo más tarde"})
            else {
                res.status(200).json({mensaje:"Tablero actualizado"})
            }
        }) 
    })
}
controller.eliminarTablero = (req, res) => {
    var {pkTiempo} = req.query
    req.getConnection((err,conn)=>{
        conn.query(`UPDATE C_TIEMPOS SET CTI_ESTADO = 0 WHERE CTI_PK_TIEMPO = ?`, [pkTiempo],
        (err, resultado)=>{
            if(err) res.status(400).json({mensaje:"Hubo un error en el sistema, favor de intentarlo más tarde"})
            else {
                res.status(200).json({mensaje:"Tablero eliminado"})
            }
        }) 
    })
}
controller.agregarUsuarioTablero = (req, res) => {
    var {pkTiempo, pkUsuario} = req.body
    req.getConnection((err,conn)=>{
        conn.query(`INSERT INTO T_USUARIOS_TIEMPO (TUS_PROPIETARIO, TUS_FK_USUARIO, TUS_FK_TIEMPO) VALUES(?, ? , ?)`,[0, pkUsuario, pkTiempo],
        (err, resultado)=>{
            if(err) res.status(400).json({mensaje:"Hubo un error en el sistema, favor de intentarlo más tarde"})
            else {
                res.status(200).json({mensaje:"Usuario agregado al tablero"})
            }
        }) 
    })
}
controller.obtenerUsuarioTablero = (req, res) => {
    var {pkTiempo} = req.query
    req.getConnection((err,conn)=>{
        conn.query(`SELECT * FROM T_USUARIOS_TIEMPO WHERE TUS_FK_TIEMPO = ?`,[pkTiempo],
        (err, resultado)=>{
            if(err) res.status(400).json({mensaje:"Hubo un error en el sistema, favor de intentarlo más tarde"})
            else {
                res.status(200).json({mensaje:"Usuarios obtenidos",data:resultado})
            }
        }) 
    })
}
controller.eliminarUsuarioTablero = (req, res) => {
    var {pkTiempo, pkUsuario} = req.body
    req.getConnection((err,conn)=>{
        conn.query(`DELETE FROM T_USUARIOS_TIEMPO WHERE TUS_FK_USUARIO = ? AND TUS_FK_TIEMPO = ?`,[pkUsuario, pkTiempo],
        (err, resultado)=>{
            if(err) res.status(400).json({mensaje:"Hubo un error en el sistema, favor de intentarlo más tarde"})
            else {
                res.status(200).json({mensaje:"Tablero creado"})
            }
        }) 
    })
}
controller.guardarComidaTablero = (req, res) => {
    var {pkTiempo, pkComida} = req.body
    req.getConnection((err,conn)=>{
        conn.query(`INSERT INTO T_TIEMPO_COMIDA (TTC_FK_TIMEPO, TTC_FK_COMIDA) VALUES(?, ?)`,[pkTiempo, pkComida],
        (err, resultado)=>{
            if(err) res.status(400).json({mensaje:"Hubo un error en el sistema, favor de intentarlo más tarde"})
            else {
                res.status(200).json({mensaje:"Tablero creado"})
            }
        }) 
    })
}
controller.eliminarComidaTablero = (req, res) => {
    var {pkTiempo, pkComida} = req.body
    req.getConnection((err,conn)=>{
        conn.query(`DELETE FROM T_TIEMPO_COMIDA WHERE TTC_FK_TIMEPO = ? AND TTC_FK_COMIDA = ?`,[pkTiempo, pkComida],
        (err, resultado)=>{
            if(err) res.status(400).json({mensaje:"Hubo un error en el sistema, favor de intentarlo más tarde"})
            else {
                res.status(200).json({mensaje:"Tablero creado"})
            }
        }) 
    })
}
module.exports = controller;