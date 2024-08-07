const express = require('express');
const passport = require('passport');
const multer = require('multer');
const userController = require('../controllers/userController');
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/signup', userController.signup);

router.post('/login', userController.login);

// router.post('/verifyToken', userController.verifyToken);

router.get(
  '/users',
  passport.authenticate('jwt', { session: false }),
  userController.getAllUsers,
);

router.get(
  '/user',
  passport.authenticate('jwt', { session: false }),
  userController.getUser,
);

router.put(
  '/user',
  passport.authenticate('jwt', { session: false }),
  upload.single('image'),
  userController.editUser,
);

router.put(
  '/user/addFollowing',
  passport.authenticate('jwt', { session: false }),
  userController.addUserFollowing,
);

router.put(
  '/user/removeFollowing',
  passport.authenticate('jwt', { session: false }),
  userController.removeUserFollowing,
);

router.post(
  '/posts',
  passport.authenticate('jwt', { session: false }),
  upload.single('image'),
  postController.createPost,
);

router.get(
  '/posts',
  passport.authenticate('jwt', { session: false }),
  postController.getAllPosts,
);

router.get(
  '/posts/:userId',
  passport.authenticate('jwt', { session: false }),
  postController.getAllPostsByAUser,
);

router.get(
  '/post/:id',
  passport.authenticate('jwt', { session: false }),
  postController.getSinglePost,
);

router.delete(
  '/posts/:id',
  passport.authenticate('jwt', { session: false }),
  postController.deletePost,
);

router.put(
  '/posts/:id/likes',
  passport.authenticate('jwt', { session: false }),
  postController.updateLikes,
);

router.post(
  '/:postId/comments',
  passport.authenticate('jwt', { session: false }),
  commentController.createComment,
);

router.get(
  '/:postId/comments',
  passport.authenticate('jwt', { session: false }),
  commentController.getComments,
);

router.put(
  '/comments/:id/likes',
  passport.authenticate('jwt', { session: false }),
  commentController.updateCommentLikes,
);

router.delete(
  '/comments/:id',
  passport.authenticate('jwt', { session: false }),
  commentController.deleteComment,
);

router.get(
  '/comments',
  passport.authenticate('jwt', { session: false }),
  commentController.getAllComments,
);

module.exports = router;
