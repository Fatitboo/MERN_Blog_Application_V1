const asyncHandler = require('express-async-handler')
const Post = require('../../models/post/Post');
const validationId = require('../../utils/validationId');
const { badWords } = require('vn-badwords');
const BadWordsFilter = require('bad-words');
const User = require('../../models/user/User');
const cloudinaryUploadImage = require('../../utils/cloudinary');
const fs = require('fs');


const createPostCtrl = asyncHandler(async (req, res) => {
    const id = req.user.id;
    validationId(id);
    try {
        const filter = new BadWordsFilter();
        const isProfaneE = filter.isProfane(req.body.title, req.body.description)
        const isProfaneVN = badWords(req.body.title, { validate: true }) && badWords(req.body.description, { validate: true })
        if (isProfaneE || isProfaneVN) {
            const user = await User.findByIdAndUpdate(id, { isBlocked: true }, { new: true });
            res.json({ message: "Your content contains profane word. Your account will be blocked" })
        }
        const localPath = `public/images/posts/${req.file.filename}`;
        const imgUpload = await cloudinaryUploadImage(localPath)
        const post = await Post.create({ ...req.body, image: imgUpload?.url, user: id });
        fs.unlinkSync(localPath)
        res.json(post)
    } catch (error) {
        res.json(error)
    }
})

const fetchAllPostsCtrl = asyncHandler(async (req, res) => {
    try {
        const posts = await Post.find({}).populate('user')
        res.json(posts)
    }
    catch (err) { res.json(err) }
})

const fetchPostCtrl = asyncHandler(async (req, res) => {
    const id = req.params.id;
    validationId(id)
    try {
        const post = await Post.findByIdAndUpdate(id,
            {
                $inc: { numViews: 1 }
            }, { new: true }).populate('user').populate('likes').populate('disLikes')
        res.json(post)
    } catch (error) {
        res.json(error)
    }
})

const updatePostCtrl = asyncHandler(async (req, res) => {
    const id = req.params.id;
    validationId(id)
    try {
        const post = await Post.findByIdAndUpdate(id, {
            ...req.body,
            user: req.user._id
        }, { new: true })
        res.json(post)
    } catch (error) {
        res.json(error)
    }
})

const deletePostCtrl = asyncHandler(async (req, res) => {
    const id = req.params.id;
    validationId(id)
    try {
        const post = await Post.findOneAndDelete(id)
        res.json(post)
    } catch (error) {
        res.json(error)
    }
})

const toggleLikePostCtrl = asyncHandler(async (req, res) => {
    const postId = req.body.postId;
    validationId(postId);
    const post = await Post.findById(postId)
    const loginUserId = req.user.id;
    const isLiked = post?.isLiked;
    const alreadyDislike = post?.disLikes.find(user => user.toString() === loginUserId.toString());
    if (alreadyDislike) {
        const updPost = await Post.findByIdAndUpdate(postId, {
            $pull: { disLikes: loginUserId },
            isDisLiked: false
        }, { new: true })

    }
    if (isLiked) {
        const updPost = await Post.findByIdAndUpdate(postId, {
            $pull: { likes: loginUserId },
            isLiked: false
        }, { new: true })
        res.json(updPost)
    } else {
        const updPost = await Post.findByIdAndUpdate(postId, {
            $push: { likes: loginUserId },
            isLiked: true
        }, { new: true })
        res.json(updPost)
    }
})

const toggleDislikePostCtrl = asyncHandler(async (req, res) => {
    const postId = req.body.postId;
    const loginUserId = req.user.id
    validationId(postId)
    const post = await Post.findById(postId)
    const isDisliked = post?.isDisLiked;
    const alreadyLike = post?.likes.find(user => user.toString() === loginUserId.toString())
    if (alreadyLike) {
        const upd = await Post.findByIdAndUpdate(postId,
            {
                $pull: { likes: loginUserId },
                isLiked: false
            }, { new: true })
    }
    if (isDisliked) {
        const upd = await Post.findByIdAndUpdate(postId,
            {
                $pull: { disLikes: loginUserId },
                isDisLiked: false
            }, { new: true })
        res.json(upd)
    } else {
        const upd = await Post.findByIdAndUpdate(postId,
            {
                $push: { disLikes: loginUserId },
                isDisLiked: true
            }, { new: true })
        res.json(upd)

    }
})


module.exports = {
    toggleDislikePostCtrl,
    toggleLikePostCtrl,
    createPostCtrl,
    fetchAllPostsCtrl,
    fetchPostCtrl,
    updatePostCtrl,
    deletePostCtrl
}