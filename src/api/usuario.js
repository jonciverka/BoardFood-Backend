const https = require('https');
const http = require('http');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const urlModule = require('url');

const mysql = require('mysql2/promise'); // O el cliente que estés usando

const controller = {}
controller.registrarUsuario = (req, res) =>{
    var {email, username, password, idUsuario} = req.body 
    var date = new Date().getTime().toString();
    if(email==''||username==''||password==''||email==''){
        res.status(400).json({mensaje:"Todos los datos son obligatorios"})
    }else if(email==null||username==null||password==null||email==null){
        res.status(400).json({mensaje:"Todos los datos son obligatorios"})
    } else if(validarEmail(email)==false){
        res.status(400).json({mensaje:"El correo introducido no es valido"})
    }
    else{
        req.getConnection((err,conn)=>{     
            conn.query(`SELECT TUS_PK_USUARIO AS PK FROM T_USUARIOS WHERE TUS_CORREO = ? AND TUS_ESTADO = 1`,
            [email],
            (err, resultado)=>{
                if(err) res.status(400).json({mensaje:"Hubo un error en el sistema, favor de intentarlo más tarde"})
                else {
                    if(resultado.length>0){
                        res.status(400).json({mensaje:"El email ya está registrado, por favor inténtelo con otro"})
                    }else{
                        req.getConnection((err,conn)=>{     
                            conn.query(`INSERT INTO T_USUARIOS (TUS_USERNAME, TUS_CORREO, TUS_ID_AUTH, TUS_PASSWORD)
                            VALUES(?, ?, ?, ?)`,[username, email, idUsuario, password],
                            (err, resultado)=>{
                                if(err) res.status(400).json({mensaje:"Hubo un error en el sistema, favor de intentarlo más tarde"})
                                else {
                                    // enviarCorreoElectronico(email,"¡Listo! Tu cuenta ha sido creada.",config.emailRegistro(nombre));
                                    res.status(200).json({mensaje:"¡Listo! Tu cuenta ha sido creada."})
                                }
                            }) 
                        }) 
                    }
                }
            }) 
        }) 
                
    }
}
controller.login = (req, res) =>{
    var {email, pass} = req.body 
    if(email==null || email == ''){
        res.status(400).json({mensaje:"Todos los datos son obligatorios"})
    }else if(pass==null || pass == ''){
        res.status(400).json({mensaje:"Todos los datos son obligatorios"})
    }else{
        req.getConnection((err,conn)=>{     
            conn.query(`SELECT * FROM T_USUARIOS WHERE TUS_CORREO = ? AND TUS_PASSWORD = ? AND TUS_ESTADO = 1`,[email,pass],
            (err, resultado)=>{
                if(err) res.status(400).json({mensaje:"Hubo un error en el sistema, favor de intentarlo más tarde"})
                else {
                    if(resultado.length>0){
                        res.status(200).json({mensaje:"Credenciales correctas"})
                    }else{
                        res.status(400).json({mensaje:"El nombre de usuario y la contraseña introducidos no existen en nuestra aplicación. Comprueba tus credenciales e inténtalo de nuevo."})
                    }
                }
            }) 
        })         
    }
}
controller.obtenerUsuario = (req, res) => {
    var {email} = req.body 
    if(email==null || email == ''){
        res.status(400).json({mensaje:"Todos los datos son obligatorios"})
    }else{
        req.getConnection((err,conn)=>{     
            conn.query(`SELECT * FROM T_USUARIOS WHERE TUS_CORREO = ? AND TUS_ESTADO = 1`,[email],
            (err, resultado)=>{
                if(err) res.status(400).json({mensaje:"Hubo un error en el sistema, favor de intentarlo más tarde"})
                else {
                    res.status(200).json({mensaje:"Usuario obtenido",data:resultado})
                }
            }) 
        })         
    }

}
controller.eliminarUsuario = (req, res) => {
    var {pkUsuario} = req.body
    if(pkUsuario==null || pkUsuario == ''){
        res.status(400).json({mensaje:"Todos los datos son obligatorios"})
    }else{
        req.getConnection((err,conn)=>{     
            conn.query(`UPDATE T_USUARIOS SET TUS_ESTADO = 0 WHERE TUS_PK_USUARIO = ?`,[pkUsuario],
            (err, resultado)=>{
                if(err) res.status(400).json({mensaje:"Hubo un error en el sistema, favor de intentarlo más tarde"})
                else {
                    res.status(200).json({mensaje:"Usuario eliminado"})
                }
            }) 
        })         
    }
}
function validarEmail(email) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  }
module.exports = controller;