const {Router} =  require('express')
const router = Router();
const usuarios = require('../api/usuario.js')
const comida = require('../api/comida.js')
const tablero = require('../api/tablero.js')

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
router.post('/api/tablero',tablero.crearTablero)
//OBTENER TABLEROs TIEMPOS
router.get('/api/tableros',tablero.obtenerTableros)
//ACTUALIZAR TABLERO TIEMPOS                    
router.put('/api/tablero',tablero.actualizarTablero)         
//ELIMINAR TABLERO TIEMPOS
router.delete('/api/tablero',tablero.eliminarTablero)
//AGREGAR USUARIO A TABLERO TIEMPOS
router.post('/api/usuarioTablero',tablero.agregarUsuarioTablero)
//ELIMINAR USUARIO A TABLERO TIEMPOS
router.delete('/api/usuarioTablero',tablero.eliminarUsuarioTablero)
//GUARDAR comida EN TABLERO 
router.post('/api/comidaTablero',tablero.guardarComidaTablero)
//Eiminar comida en tablero
router.delete('/api/comidaTablero',tablero.eliminarComidaTablero)




//----------------------CATALOGOS------------------
// router.get('/api/obtenerCategorias',catalogos.obtenerCategorias)

router.get('*', function(req, res) {    
        res.status(404).json({mensaje:"Error 404", estado: false})
})
router.post('*', function(req, res) {    
        res.status(404).json({mensaje:"Error 404", estado: false})
})
module.exports = router;

