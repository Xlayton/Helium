require("dotenv").config();
const express = require("express"),
    pug = require('pug'),
    multer = require('multer'),
    route = require('./routes/routes.js'),
    path = require('path'),
    expressSession = require('express-session'),
    bcrypt = require('bcrypt-nodejs'),
    bodyParser = require('body-parser'),
    pg = require('pg');
const PORT = process.env.PORT;

const app = express();

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