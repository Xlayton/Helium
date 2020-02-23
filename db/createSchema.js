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

exports.getAllUsers = () => {
    pool
        .query('select * from Users')
        .then(res => console.log(res.rows.forEach((r) => console.log(r))))
        .catch(err => console.error(err));
}

exports.addUser = (user) => {
    pool
    .query(`insert into Users(id,name,email,icon,password) values(${user.id},'${user.name}','${user.email}','${user.icon}','${user.password}')`)
    .catch(err => console.error(err));
}

exports.removeUser = (user) => {
    pool
    .query(`delete from Users where id = ${user.id}`)
    .catch(err => console.error(err));
}

exports.updateUser = (user, newUser) => {
    pool
    .query(`update Users set name='${newUser.name}', email='${newUser.email}', icon='${newUser.icon}', password='${newUser.password}' where id = ${user.id}`)
    .catch(err => console.error(err));
}

exports.getUser = (id) => {
    pool
    .query(`select * from Users where id=${id}`)
    .then(res => console.log(res.rows[0]))
    .catch(err => console.error(err));
}