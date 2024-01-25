const mongoose = require('mongoose');

const { Schema } = mongoose;

const PostSchema = new Schema(
  {
    content: {
      type: {
        type: String,
        enum: ['text', 'image'],
        required: true,
      },
      data: String,
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);

module.exports = mongoose.model('Post', PostSchema);
