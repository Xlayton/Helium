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
const fs = require('fs');
const http = require('http');
const PORT = process.env.PORT;


const app = express();
app.use(express.static(path.join(__dirname+'/public')));

const httpServer = http.createServer(app);
httpServer.listen(PORT + 1, () => {
    console.log(`Server Listening on port: ${PORT + 1}`)
});

app.set('view engine', 'pug');
const expressWs = require("express-ws")(app);
app.set('views', __dirname + '/views');
app.use(expressSession({
    secret: process.env.SECRET,
    saveUninitialized: true,
    resave: true
}));

var urlencodedParser = bodyParser.urlencoded({
    extended: false
});
const upload = multer({
    dest: '/temp'
});

app.get("/", route.getIndex);
app.get('/seeUsers', route.viewUsers);
app.get('/createUser', route.createUserPage);
app.post('/createUser',urlencodedParser, route.createAUser);
app.get('/updateUser/:id', route.updateUserPage);
app.post('/updateUser/:id', urlencodedParser, upload.single('icon'), route.updateUserDetails);
app.get('/deleteUser/:id', route.deleteUser);
app.get('/signIn', route.signIn);
app.post('/signIn', urlencodedParser, route.signUserIn);
app.get('/signOut/:id', route.signUserOut);
app.ws("/makeConnection", route.makeConnection);

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.listen(PORT);