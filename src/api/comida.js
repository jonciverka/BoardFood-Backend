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
        var realFile = Buffer.from(foto,"base64");
        fs.writeFile('./../../boardFoodImage/'+nameImage, realFile, function(err) {
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
controller.actualizarComida = (req, res) => {
    var {pkComida, nombre, imagen, calificacion, notas, pksTiempo} = req.body
    var pksTiempo = pksTiempo?.split(",") ?? [];
    var date = new Date().getTime().toString();
    var nameImage = null;
    if(imagen!=null && imagen != ''){
        nameImage = date+".jpg"; 
        var realFile = Buffer.from(foto,"base64");
        fs.writeFile('./../../boardFoodImage/'+nameImage, realFile, function(err) {
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
module.exports = controller;