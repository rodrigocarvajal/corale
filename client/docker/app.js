const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('dotenv').config()

const app = express();

const REACT_BUILD_DIR = './build/';

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/test', (req, res) => {
    res.status(200).json({ message: 'docker running' });
});

/*
app.get('/*', (req, res, next) => {
    let ipv4 = undefined;
    const ipv6 = req._remoteAddress;
    ipv6.includes('::ffff:') ? ipv4 = ipv6.split(':')[3] : ipv4 = null;
    IpModel.create({ ipv4, ipv6 }, err => { });
    next();
});
*/

app.use(express.static(path.join(__dirname, REACT_BUILD_DIR)));
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, REACT_BUILD_DIR, 'index.html'), (err) => {
        if (err) {
            res.status(500).send(err)
        }
    });
});

module.exports = app;
