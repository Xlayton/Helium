require("dotenv").config();
const path = require('path');
const express = require("express");
const pug = require('pug');
const PORT = process.env.PORT;

const db = require('./db/createSchema');
// you can test in here using db :)

const app = express();
app.use(express.static(path.join(__dirname+'/public')));

app.listen(PORT);