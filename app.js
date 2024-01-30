require('dotenv').config();
require('./passport/passport');

const express = require('express');
const cookieParser = require('cookie-parser');
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

app.use(express.json());
app.use(
  cors({
    origin: 'https://snapshpere.vercel.app',
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use('/', indexRouter);

module.exports = app;
