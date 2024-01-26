const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const cloudinary = require('cloudinary').v2;
const Post = require('../models/post');

exports.createPost = [
  body('text').custom(async (content) => {
    if (content === String) {
      if (!content) {
        throw new Error('Post is empty');
      }
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
      let imageUrl;

      if (req.file) {
        try {
          const uniqueIdentifier = uuidv4();

          const imageBuffer = req.file.buffer.toString('base64');

          const result = await cloudinary.uploader.upload(
            `data:${req.file.mimetype};base64,${imageBuffer}`,
            { public_id: uniqueIdentifier, folder: 'SnapSphere/posts/' },
          );

          imageUrl = result.secure_url;
        } catch (error) {
          console.error('Error uploading image to cloud:', error);
          return res
            .status(500)
            .json({ error: 'Error uploading image to cloud' });
        }
      }

      let newPost;

      if (!imageUrl) {
        newPost = new Post({
          text: req.body.text,
          userId: req.user._id,
          comments: [],
          likes: [],
        });
      } else if (req.body.text) {
        newPost = new Post({
          text: req.body.text,
          imageUrl,
          userId: req.user._id,
          comments: [],
          likes: [],
        });
      } else {
        newPost = new Post({
          imageUrl,
          userId: req.user._id,
          comments: [],
          likes: [],
        });
      }

      try {
        await newPost.save();
        res.status(200).json({ message: 'New post created successfully' });
      } catch (err) {
        res
          .status(400)
          .json({ 'An error occurred while creating a new post': err });
      }
    }
  }),
];

exports.getAllPosts = asyncHandler(async (req, res, next) => {
  try {
    const userAndFollowings = [req.user._id, ...req.user.following];

    const posts = await Post.find({ userId: { $in: userAndFollowings } })
      .populate({
        path: 'comments',
        populate: { path: 'userId', select: 'username profilePicture' },
      })
      .populate('userId');
    res.status(200).json({ posts });
  } catch (err) {
    res.status(400).json({ err });
  }
});

exports.deletePost = asyncHandler(async (req, res, next) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      res.status(404).json({ err: `No posts with id ${req.params.id} exists` });
    }
    await Comment.deleteMany({
      postId: req.params.id,
    });
    res.status(200).json({
      message: `Post with id ${req.params.id} deleted successfully`,
    });
  } catch (err) {
    res.status(403).json({ err });
  }
});
