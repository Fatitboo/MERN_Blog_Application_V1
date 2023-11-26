const expressAsyncHandler = require("express-async-handler");
const Comment = require("../../models/comment/Comment");
const validationId = require("../../utils/validationId");


const createCmtCtrl = expressAsyncHandler(async (req, res) => {
    const loginUser = req.user;
    const { post, description } = req.body;

    validationId(post);
    try {
        const cmt = await Comment.create({
            post,
            description,
            user: loginUser
        })
        res.json(cmt)
    } catch (error) {
        res.json(error)
    }
})
const fetchAllCmtCtrl = expressAsyncHandler(async (req, res) => {
    try {
        const cmts = await Comment.find({}).sort("-createAt")
        res.json(cmts)
    } catch (error) {
        res.json(error)
    }
})
const fetchCmtCtrl = expressAsyncHandler(async (req, res) => {
    const cmtId = req.params.id;
    validationId(cmtId);
    try {
        const cmt = await Comment.findById(cmtId)
        res.json(cmt)
    } catch (error) {
        res.json(error)
    }
})
const updateCmtCtrl = expressAsyncHandler(async (req, res) => {
    const cmtId = req.params.id;
    validationId(cmtId);
    try {
        const des = req.body.description;
        const cmt = await Comment.findOneAndUpdate({ _id: cmtId },
            {
                description: des
            }, { new: true, runValidators: true })
        res.json(cmt)
    } catch (error) {
        res.json(error)
    }
})
const deleteCmtCtrl = expressAsyncHandler(async (req, res) => {
    const cmtId = req.params.id;
    validationId(cmtId);
    try {
        const cmt = await Comment.findByIdAndDelete(cmtId)
        res.json(cmt)
    } catch (error) {
        res.json(error)
    }
})
module.exports = {
    fetchCmtCtrl,
    createCmtCtrl,
    fetchAllCmtCtrl,
    updateCmtCtrl,
    deleteCmtCtrl
}