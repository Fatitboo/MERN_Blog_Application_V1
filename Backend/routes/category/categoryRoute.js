const express = require('express');
const authMiddlerware = require('../../middlewares/auth/authMiddlerware');
const { createCategoryCtrl, fetchAllCtCtrl, fetchDetailCtrl, updateCtCtrl, deleteCtCtrl } = require('../../controllers/category/categoryController');
const categoryRoute = express.Router();

categoryRoute.post('/', authMiddlerware, createCategoryCtrl)
categoryRoute.get('/', authMiddlerware, fetchAllCtCtrl)
categoryRoute.get('/:id', authMiddlerware, fetchDetailCtrl)
categoryRoute.put('/:id', authMiddlerware, updateCtCtrl)
categoryRoute.delete('/:id', authMiddlerware, deleteCtCtrl)
module.exports = categoryRoute;