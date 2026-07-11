const mysql = require('mysql');

const connection = mysql.createConnection({
    host : '51.222.30.154',
    port: '3306',
    user: 'jonathan',
    password: '7I4cm5Gj7iN%',
    database : 'BoardFood'
});

connection.connect();

connection.query('SELECT * FROM C_TIEMPOS WHERE CTI_PK_TIEMPO IN (4, 5)', (err, rows) => {
  console.log('=== C_TIEMPOS ===');
  console.log(rows);
  
  connection.query('SELECT * FROM T_USUARIOS_TIEMPO WHERE TUS_FK_TIEMPO IN (4, 5)', (err, rows2) => {
    console.log('=== T_USUARIOS_TIEMPO ===');
    console.log(rows2);
    
    connection.query('SELECT * FROM T_TIEMPO_COMIDA WHERE TTC_FK_TIMEPO IN (4, 5)', (err, rows3) => {
      console.log('=== T_TIEMPO_COMIDA ===');
      console.log(rows3);
      connection.end();
    });
  });
});
