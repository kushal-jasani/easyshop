const express=require('express');
const feedController=require('../controller/feed')
const {isAuth}=require('../middleware/is-auth')
const { upload } = require("../uploads/multer");
const router = express.Router();

router.post('/addpost',isAuth,upload.fields([
    { name: "posts", maxCount: 5 }
  ]),feedController.addPost);

router.get('/posts',isAuth,feedController.getPost);

router.post('/posts/:postId/like',isAuth,feedController.addLike);
router.delete('/posts/:postId/like',isAuth,feedController.removeLike);

router.post('/posts/:postId/comment',isAuth,feedController.addComment);
router.delete('/posts/comments/:commentId',isAuth,feedController.removeComment);
router.get('/posts/:postId/comments',isAuth,feedController.getComments);


module.exports=router
