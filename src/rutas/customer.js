const {Router} =  require('express')
const router = Router();
const usuarios = require('../api/usuario.js')
const comida = require('../api/comida.js')

//----------------------acceso------------------
//Registro 
router.post('/api/usuario',usuarios.registrarUsuario)
//login
router.post('/api/login',usuarios.login)
//obtener usuario
router.get('/api/usuario',usuarios.obtenerUsuario)
//eliminar usuarios
router.delete('/api/usuario',usuarios.eliminarUsuario)
//----------------------COMIDA------------------
//CREAR COMIDA
router.post('/api/comida',comida.crearComida)
//OBTENER COMIDAS
router.get('/api/comida',comida.obtenerComidas)
//ACTUALIZAR COMIDA
router.put('/api/comida',comida.actualizarComida)
//ELIMINAR COMIDA
router.delete('/api/comida',comida.eliminarComida)

//GUARDAR COMUDA EN TABLERO 
//ELIMINAR COMIDA EN TABLERO 
//GENERAR SEMANA DE COMIDA
//----------------------TABLERO TIEMPOS------------------
//OBTENER TABLERO TIEMPOS
//CREAR TABLERO TIEMPOS
//ACTUALIZAR TABLERO TIEMPOS                             
//ELIMINAR TABLERO TIEMPOS
//AGREGAR USUARIO A TABLERO TIEMPOS
//ELIMINAR USUARIO A TABLERO TIEMPOS



//

//----------------------CATALOGOS------------------
// router.get('/api/obtenerCategorias',catalogos.obtenerCategorias)

router.get('*', function(req, res) {    
        res.status(404).json({mensaje:"Error 404", estado: false})
})
router.post('*', function(req, res) {    
        res.status(404).json({mensaje:"Error 404", estado: false})
})
module.exports = router;

