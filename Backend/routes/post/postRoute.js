const express = require("express");
const {
    createPostCtrl,
    fetchAllPostsCtrl,
    fetchPostCtrl,
    updatePostCtrl,
    deletePostCtrl,
    toggleLikePostCtrl,
    toggleDislikePostCtrl
} = require("../../controllers/post/postController");
const authMiddlerware = require("../../middlewares/auth/authMiddlerware");
const {
    postImgResizing,
    PhotoUpload
} = require("../../middlewares/upload/photoUpload");

const postRoute = express.Router()

postRoute.post(
    '/',
    authMiddlerware,
    PhotoUpload.single("image"),
    postImgResizing,
    createPostCtrl);
postRoute.get('/', fetchAllPostsCtrl)
postRoute.get('/:id', fetchPostCtrl)
postRoute.put('/like', authMiddlerware, toggleLikePostCtrl);
postRoute.put('/dislike', authMiddlerware, toggleDislikePostCtrl);


postRoute.put('/:id', authMiddlerware, updatePostCtrl);
postRoute.delete('/:id', authMiddlerware, deletePostCtrl)
module.exports = postRoute;