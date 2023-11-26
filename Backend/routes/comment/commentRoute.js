const express = require('express');
const {
    createCmtCtrl,
    fetchAllCmtCtrl,
    fetchCmtCtrl,
    updateCmtCtrl,
    deleteCmtCtrl
} = require('../../controllers/comment/commentController');
const authMiddlerware = require('../../middlewares/auth/authMiddlerware');
const cmtRoute = express.Router();

cmtRoute.post('/', authMiddlerware, createCmtCtrl)

cmtRoute.get('/',authMiddlerware, fetchAllCmtCtrl)

cmtRoute.get('/:id',authMiddlerware, fetchCmtCtrl)

cmtRoute.put('/:id', authMiddlerware, updateCmtCtrl)

cmtRoute.delete('/:id', authMiddlerware, deleteCmtCtrl)
module.exports = cmtRoute;