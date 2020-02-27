require("dotenv").config();
const express = require("express");
const pug = require('pug');
const multer = require('multer');
const route = require('./routes/routes.js');
const path = require('path');
const expressSession = require('express-session');
const bcrypt = require('bcrypt-nodejs');
const bodyParser = require('body-parser');
const fs = require('fs');
const PORT = process.env.PORT;

const db = require('./db/createSchema');
// db.addUser({
//     id: 3,
//     name: "User",
//     email: "Email",
//     icon: "Icon",
//     password: "Password"
// })
// db.getAllUsers().then(res => console.log(res));
// db.getUser(3).then(res => console.log(res));

const app = express();
const expressWs = require("express-ws")(app);
app.use(express.static(path.join(__dirname+'/public')));

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

app.use(express.static(path.join(__dirname + '/public')));
app.use(expressSession({
    secret: 'pass',
    saveUninitialized: true,
    resave: true
}));

var urlencodedParser = bodyParser.urlencoded({
    extended: false
});

app.get("/", route.getIndex);
app.get('/seeUsers', route.viewUsers);
app.get('/createUser', route.createUserPage);
app.post('/createUser',urlencodedParser, route.createAUser);
app.get('/updateUser/:id', route.updateUserPage);
app.post('/updateUser/:id', urlencodedParser,route.updateUserDetails);
app.get('/deleteUser/:id', route.deleteUser);
app.ws("/makeConnection", route.makeConnection);

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.listen(PORT);