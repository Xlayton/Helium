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

exports.getAllUsers = async () => {
    return pool
        .query('select * from users')
        .then(res => res.rows)
        .catch(err => console.error(err));
}

exports.addUser = (user) => {
    pool
    .query(`insert into users(id,name,email,icon,password) values(${user.id},'${user.name}','${user.email}','${user.icon}','${user.password}')`)
    .catch(err => console.error(err));
}

exports.removeUser = (user) => {
    pool
    .query(`delete from users where id = ${user.id}`)
    .catch(err => console.error(err));
}

exports.updateUser = (user, newUser) => {
    pool
    .query(`update users set name='${newUser.name}', email='${newUser.email}', icon='${newUser.icon}', password='${newUser.password}' where id = ${user.id}`)
    .catch(err => console.error(err));
}

exports.getUser = async (id) => {
    return pool
    .query(`select * from users where id=${id}`)
    .then(res => res.rows[0])
    .catch(err => console.error(err));
}