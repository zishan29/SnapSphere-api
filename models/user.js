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

UserSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.password;
  },
});

module.exports = mongoose.model('User', UserSchema);
