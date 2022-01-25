const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('promise-mysql')
const path = require('path');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const config = require('./config');
const {secret} = require("./config");

const pool = mysql.createPool(config.pool);

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, \ Authorization');
    next();
});

const apiRouter = require('./app/routes/api')(express, pool, jwt);
app.use('/api', apiRouter);

app.listen(8081);

console.log('Running on port 8081');
