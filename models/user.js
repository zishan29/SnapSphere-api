const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    username: { type: String, require: true },
    email: { type: String, required: true },
    password: { type: String, require: true },
    followers: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    following: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    profilePicture: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model('User', UserSchema);
