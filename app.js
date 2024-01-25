require('dotenv').config();
require('./passport/passport');

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;

const indexRouter = require('./routes/index');

const app = express();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const mongoDb = process.env.MONGODB_URI;
mongoose.connect(mongoDb);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongo connection error'));

const corsOptions = {
  origin: [
    'https://snaptalk-411413.web.app',
    'https://snaptalk-411413.firebaseapp.com',
    'http://localhost:3000',
  ],
  optionsSuccessStatus: 200,
};

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.options('*', cors(corsOptions));

app.use('/', cors(corsOptions), indexRouter);

module.exports = app;
