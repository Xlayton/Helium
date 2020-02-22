require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DBHOST,
    user: 'postgres',
    max: 1000,
    port: process.env.DBPORT,
    password: process.env.DBPASS,
    database: process.env.DB
});

pool
    .query('select * from Users')
    .then(res => console.log(res.rows[0]))
    .catch(err => console.error(err));

exports.addUser = (user) => {

}

exports.removeUser = (user) => {

}

exports.updateUser = (user, newUser) => {

}

exports.getUser = (id) => {

}