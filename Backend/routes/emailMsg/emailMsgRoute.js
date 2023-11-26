const express = require('express');
const authMiddlerware = require('../../middlewares/auth/authMiddlerware');
const { createEmailMsg } = require('../../controllers/emaiMsg/emailMsgCtrl');
const emailMsgRoute = express.Router();

emailMsgRoute.post('/', authMiddlerware,createEmailMsg)
module.exports=emailMsgRoute