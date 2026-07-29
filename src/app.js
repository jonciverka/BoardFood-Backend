const express  = require('express')
const path =  require('path')
const morgan = require('morgan')
const config = require('./config')
var  axios =  require('axios')
var cors = require('cors');
var CronJob = require('cron').CronJob;
const bodyParser = require('body-parser');

const mysql  = require('mysql')
const myConnection = require('express-myconnection')

const http = require('http');
const {Server} = require('socket.io');



const app = express()


//SOCKETIO
const server = http.createServer(app);
const io = new Server(server);
//SOCKETIO

// importando rutas
const customerRutas =  require('./rutas/customer')
// Asignadndo puertos
const PORT = config.PORT;
//motor de vistas
app.set('view engine','html')
app.set("views",path.join(__dirname,'views'))


app.use(cors());
//moddlewares
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(morgan('dev'))
app.use(myConnection(mysql, {
    host: process.env.DB_HOST || config.DB_HOST,
    port: process.env.DB_PORT || config.DB_PORT,
    user: process.env.DB_USER || config.DB_USER,
    password: process.env.DB_PASSWORD || config.DB_PASSWORD,
    database: process.env.DB_NAME || config.DB_NAME,
    multipleStatements: true,
    charset: "utf8mb4"
}))

app.use(express.urlencoded({extended: false}))
app.use(express.json())
// static files
 app.use(express.static(__dirname + '/views'))
 const imagenesPath = process.env.NODE_ENV === 'production' || process.env.UPLOADS_PATH
   ? (process.env.UPLOADS_PATH || '/boardFoodImage')
   : path.join(__dirname, '../../boardFoodImage');
 app.use('/recursos', express.static(imagenesPath))
//rutas
app.use("/", customerRutas)

server.listen(PORT, ()=>{
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
})
