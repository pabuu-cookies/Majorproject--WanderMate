const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.loadEnvFile.MYSQL_DATABASE
});

connection.connect((err)=>{
    if(err){
        console.error('Error connecting to MySql: ' + err.stack);
    }
    console.log('✌Connected to Mysql✌');
});

module.exports = connection;