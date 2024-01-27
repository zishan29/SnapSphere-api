const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const Comment = require('../models/comment');
const Post = require('../models/post');

exports.createComment = [
  body('comment').custom(async (comment) => {
    if (!comment) {
      throw new Error('Comment is empty');
    }
  }),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = {};
      errors.array().forEach((error) => {
        const { path, msg } = error;
        if (!errorMessages[path]) {
          errorMessages[path] = [];
        }
        errorMessages[path].push(msg);
      });

      res.status(400).json({ errors: errorMessages });
    } else {
      const newComment = new Comment({
        userId: req.user._id,
        comment: req.body.comment,
        likes: [],
        postId: req.params.id,
      });
      try {
        const savedComment = await newComment.save();

        await Post.findByIdAndUpdate(
          req.params.id,
          { $push: { comments: savedComment._id } },
          { new: true },
        );

        res.status(200).json({ message: 'Comment created successfully' });
      } catch (err) {
        res.status(400).json({ err });
      }
    }
  }),
];

exports.getComments = asyncHandler(async (req, res, next) => {
  try {
    const comments = await Comment.findById({ postId: req.params.postId });
    res.status(200).json({ comments });
  } catch (err) {
    res.status(400).json({ err });
  }
});

exports.deleteComment = asyncHandler(async (req, res, next) => {
  try {
    const deletedComment = await Comment.findByIdAndDelete(req.params.id);

    const { postId } = deletedComment;
    await Post.findByIdAndUpdate(postId, {
      $pull: { comments: req.params.id },
    });

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (err) {
    res.status(400).json({ err });
  }
});

exports.updateCommentLikes = async (req, res) => {
  const { id } = req.params;

  try {
    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the user has already liked the comment
    const hasLiked = comment.likes.includes(req.user._id);

    if (hasLiked) {
      // User already liked, unlike the comment
      comment.likes = comment.likes.filter(
        (userId) => userId.toString() !== req.user._id.toString(),
      );
    } else {
      // User hasn't liked, like the comment
      comment.likes.push(req.user._id);
    }

    await comment.save();

    res.status(200).json({ likes: comment.likes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
