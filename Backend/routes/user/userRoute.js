const express = require('express');
const {
    registerController,
    loginController,
    fetchAllUsersController,
    deleteUsrController,
    getUserDetailController,
    getUserProfileController,
    updateUserController,
    updatePasswordController,
    followingCtrl,
    unFollowCtrl,
    blockCtrl,
    unBlockCtrl,
    generateVerifiedTokenCtrl,
    updateVerifyAccountCtrl,
    resetPasswordCtrl,
    generateResetTokenCrtl,
    profilePhotoUploadCtrl
} = require('../../controllers/user/userController.js');
const authMiddlerware = require('../../middlewares/auth/authMiddlerware');
const {
    PhotoUpload,
    profilePhotoResizing
} = require('../../middlewares/upload/photoUpload.js');
const userRouter = express.Router();

userRouter.get('/', authMiddlerware, fetchAllUsersController);

userRouter.post('/register', registerController);
userRouter.post('/login', loginController);
userRouter.post('/generate-verify-email-token',authMiddlerware, generateVerifiedTokenCtrl);
userRouter.post(
    '/profile-upload',
    authMiddlerware,
    PhotoUpload.single("image"), 
    profilePhotoResizing,
    profilePhotoUploadCtrl
    );

userRouter.post('/generate-reset-pass-token', generateResetTokenCrtl);

userRouter.get('/profile/:id', authMiddlerware, getUserProfileController);

userRouter.put('/password', authMiddlerware, updatePasswordController);

userRouter.put('/verify-account',authMiddlerware, updateVerifyAccountCtrl);

userRouter.put('/reset-password', resetPasswordCtrl);

userRouter.put('/follow',authMiddlerware, followingCtrl);

userRouter.put('/unFollow', authMiddlerware, unFollowCtrl);

userRouter.put('/blockuser/:id', authMiddlerware, blockCtrl);

userRouter.put('/unblock/:id', authMiddlerware, unBlockCtrl);

userRouter.put('/:id', authMiddlerware, updateUserController);
userRouter.get('/:id', authMiddlerware, getUserDetailController);
userRouter.delete('/:id', authMiddlerware, deleteUsrController);

module.exports = userRouter;