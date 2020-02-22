require("dotenv").config();
const express = require("express"),
    pug = require('pug');
const PORT = process.env.PORT;

require('./db/createSchema');

const app = express();

app.listen(PORT);