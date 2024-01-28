#! /usr/bin/env node

require('dotenv').config();

const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');
const User = require('./models/user');
const Post = require('./models/post');

async function main() {
  console.log('Debug: About to connect');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Debug: Should be connected?');

  const userPromises = Array.from({ length: 2 }, () => createPost());

  try {
    await Promise.all(userPromises);
    console.log('Debug: Closing mongoose');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error occurred:', err);
  }
}

async function createUser() {
  return new Promise(async (resolve, reject) => {
    const hashedPassword = await bcrypt.hash(faker.internet.password(), 12);
    const newUser = new User({
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: hashedPassword,
      followers: [],
      following: [],
      profilePicture: faker.image.avatar(),
    });

    try {
      await newUser.save();
      console.log('New user added successfully');
      resolve();
    } catch (err) {
      console.log('Some error occurred while adding user:', err);
      reject(err);
    }
  });
}

async function createPost() {
  return new Promise(async (resolve, reject) => {
    const newPost = new Post({
      imageUrl: faker.image.cats(),
      userId: '65b276e00fc24d6a9f8760de',
    });

    try {
      await newPost.save();
      console.log('New post added successfully');
      resolve();
    } catch (err) {
      console.log('Some error occurred while adding post');
      reject(err);
    }
  });
}

main();
