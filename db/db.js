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

exports.getAllUsers = async() => {
    return pool
        .query('select * from users')
        .then(res => res.rows)
        .catch(err => console.error(err));
};

exports.addUser = user => {
    pool
        .query(`insert into users(name,email,icon,password) values('${user.name}','${user.email}','${user.icon}','${user.password}')`)
        .catch(err => console.error(err));
};

exports.removeUser = user => {
    pool
        .query(`delete from users where id = ${user.id}`)
        .catch(err => console.error(err));
};

exports.updateUser = (user, newUser) => {
    pool
        .query(`update users set name='${newUser.name}', email='${newUser.email}', icon='${newUser.icon}', password='${newUser.password}' where id = ${user.id}`)
        .catch(err => console.error(err));
};

exports.getUser = async id => {
    return pool
        .query(`select * from users where id=${id}`)
        .then(res => res.rows[0])
        .catch(err => console.error(err));
};

exports.createAllTables = password => {
    if (password !== process.env.PASSWORD) {
        return;
    } else {
        pool.query('create table channels(id serial PRIMARY KEY,name text NOT NULL,messages bigint[],users bigint[],roles bigint[],permissions text)').catch(err => console.log(err))
        pool.query('create table chatrooms(id serial PRIMARY KEY,name text NOT NULL,icon text,visibility boolean NOT NULL,channels bigint[],users bigint[],roles bigint[],emojis bigint[])').catch(err => console.log(err))
        pool.query('create table emojis(id serial PRIMARY KEY,img text NOT NULL,name text NOT NULL)').catch(err => console.log(err))
        pool.query('create table messages(id serial PRIMARY KEY,msg text NOT NULL,usr bigint NOT NULL,reactions bigint[])').catch(err => console.log(err))
        pool.query('create table reactions(id serial PRIMARY KEY,emoji bigint NOT NULL,usr bigint NOT NULL)').catch(err => console.log(err))
        pool.query('create table roles(id serial PRIMARY KEY,name text NOT NULL,color text,permission bigint NOT NULL)').catch(err => console.log(err))
        pool.query('create table users(id serial PRIMARY KEY,name text NOT NULL,email text NOT NULL,icon text,password text NOT NULL,friends bigint[],theme text,chatrooms bigint[])').catch(err => console.log(err))
    }
}


exports.dropAllTables = password => {
    if (password !== process.env.PASSWORD) {
        return;
    } else {
        pool.query('drop table channels').catch(err => console.log(err))
        pool.query('drop table chatrooms').catch(err => console.log(err))
        pool.query('drop table emojis').catch(err => console.log(err))
        pool.query('drop table messages').catch(err => console.log(err))
        pool.query('drop table reactions').catch(err => console.log(err))
        pool.query('drop table roles').catch(err => console.log(err))
        pool.query('drop table users').catch(err => console.log(err))
    }
}