const expressAsyncHandler = require("express-async-handler");
const Category = require('../../models/category/Category');
const validationId = require("../../utils/validationId");
const createCategoryCtrl = expressAsyncHandler(async (req, res)=>{
    try {
        const ct = await Category.create({
            user:req?.user._id,
            title:req.body.title
        })
        res.json(ct)
    } catch (error) {
        res.json(error)       
    }
})

const fetchAllCtCtrl = expressAsyncHandler(async(req, res)=>{
    try {
        const ct = await Category.find({}).populate('user').sort("-createAt")
        res.json(ct)
    } catch (error) {
        res.json(error)
    }
})

const fetchDetailCtrl = expressAsyncHandler(async(req, res)=>{
    const id = req.params.id;
    validationId(id)
    try {
        const ct = await Category.findById(id).populate('user').sort("-createAt")
        res.json(ct)
    } catch (error) {
        res.json(error)
    }
})
const updateCtCtrl = expressAsyncHandler(async(req, res)=>{
    const id = req.params.id;
    validationId(id)
    try {
        const ct = await Category.findByIdAndUpdate(id,{
            title:req.body.title,

        }, {new: true})
        res.json(ct)
    } catch (error) {
        res.json(error)
    }
})
const deleteCtCtrl = expressAsyncHandler(async(req, res)=>{
    const id = req.params.id;
    validationId(id)
    try {
        const ct = await Category.findByIdAndDelete(id)
        res.json(ct)
    } catch (error) {
        res.json(error)
    }
})
module.exports={
    createCategoryCtrl,
    fetchAllCtCtrl,
    fetchDetailCtrl,
    updateCtCtrl,
    deleteCtCtrl
}