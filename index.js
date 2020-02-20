require("dotenv").config();
const express = require("express"),
    pug = require('pug');
const PORT = process.env.PORT;

const app = express();

app.listen(PORT);