const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const User = require('../../models/user/User')

const authMiddlerware = asyncHandler(async (req, res, next) => {
    if ((req?.headers?.authorization)?.startsWith("Bearer")) {
        try {
            const token = req?.headers?.authorization.split(" ")[1];
            if (token) {
                const decode = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById( decode?.id ).select("-password");
                req.user = user;   
                next();
            }            
        } catch (error) {
            throw new Error('Not authorized token expired, login again')
        }
    }
    else {
        throw new Error("No token attach with")
    }
})
module.exports = authMiddlerware;