require("dotenv").config();
const path = require('path');
const express = require("express");
const pug = require('pug');
const PORT = process.env.PORT;

require('./db/createSchema');

const app = express();
app.use(express.static(path.join(__dirname+'/public')));

app.listen(PORT);