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
router.get('/api/comida',comida.obtenerComida)
//OBTENER COMIDA
router.get('/api/comidas',comida.obtenerComidas)
//ACTUALIZAR COMIDA
router.put('/api/comida',comida.actualizarComida)
//ELIMINAR COMIDA
router.delete('/api/comida',comida.eliminarComida)


//GENERAR SEMANA DE COMIDA
//GENERAR COMIDA ALEATORIA
//----------------------TABLERO TIEMPOS------------------
//CREAR TABLERO TIEMPOS
router.post('/api/tablero',comida.crearTablero)
//OBTENER TABLERO TIEMPOS
router.get('/api/tablero',comida.obtenerTablero)
//ACTUALIZAR TABLERO TIEMPOS                    
router.put('/api/tablero',comida.actualizarTablero)         
//ELIMINAR TABLERO TIEMPOS
router.delete('/api/tablero',comida.eliminarTablero)
//AGREGAR USUARIO A TABLERO TIEMPOS
//ELIMINAR USUARIO A TABLERO TIEMPOS
//GUARDAR COMUDA EN TABLERO 
//Eiminar comida en tablero




//----------------------CATALOGOS------------------
// router.get('/api/obtenerCategorias',catalogos.obtenerCategorias)

router.get('*', function(req, res) {    
        res.status(404).json({mensaje:"Error 404", estado: false})
})
router.post('*', function(req, res) {    
        res.status(404).json({mensaje:"Error 404", estado: false})
})
module.exports = router;

