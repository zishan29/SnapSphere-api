const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const cloudinary = require('cloudinary').v2;
const Post = require('../models/post');
const User = require('../models/user');

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
        const savedPost = await newPost.save();
        await savedPost.populate('userId');
        res
          .status(200)
          .json({ message: 'New post created successfully', post: savedPost });
      } catch (err) {
        res.status(400).json({
          error: 'An error occurred while creating a new post',
          details: err,
        });
      }
    }
  }),
];

exports.getAllPosts = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.user._id })
      .populate('followers', '_id')
      .populate('following', '_id');
    const userAndFollowings = [req.user._id, ...(user.following || [])];
    const posts = await Post.find({ userId: { $in: userAndFollowings } })
      .populate({
        path: 'comments',
        populate: { path: 'userId', select: 'username profilePicture' },
      })
      .populate('userId');
    console.log(posts);
    res.status(200).json({ posts });
  } catch (err) {
    console.error('Error in getAllPosts:', err);
    res.status(400).json({ err });
  }
});

exports.getAllPostsByAUser = asyncHandler(async (req, res, next) => {
  try {
    const posts = await Post.find({ userId: req.params.userId })
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

exports.getSinglePost = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;

    const posts = await Post.findById(id)
      .populate({
        path: 'comments',
        populate: { path: 'userId', select: 'username profilePicture' },
      })
      .populate('userId');
    res.status(200).json({ posts });
  } catch (err) {
    console.error('Error in getAllPosts:', err);
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

exports.updateLikes = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user has already liked the post
    const hasLiked = post.likes.includes(req.user._id);

    if (hasLiked) {
      // User already liked, unlike the post
      post.likes = post.likes.filter(
        (userId) => userId.toString() !== req.user._id.toString(),
      );
    } else {
      // User hasn't liked, like the post
      post.likes.push(req.user._id);
    }

    await post.save();

    res.status(200).json({ likes: post.likes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
