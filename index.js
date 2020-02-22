require("dotenv").config();
const express = require("express");
const pug = require('pug');
const multer = require('multer');
const route = require('./routes/routes.js');
const path = require('path');
const expressSession = require('express-session');
const bcrypt = require('bcrypt-nodejs');
const bodyParser = require('body-parser');
const pg = require('pg');
const PORT = process.env.PORT;

const app = express();
app.use(express.static(path.join(__dirname+'/public')));

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

app.use(express.static(path.join(__dirname + '/public')));
app.use(expressSession({
    secret: 'pass',
    saveUninitialized: true,
    resave: true
}));

app.get('/seeUsers', route.viewUsers);
app.get('/createUser', route.createUserPage);
app.post('/createUser', route.createAUser);
app.get('/updateUser', route.updateUserPage);
app.post('/updateUser', route.updateUserDetails);
app.get('/deleteUser', route.deleteUser);


app.listen(PORT);