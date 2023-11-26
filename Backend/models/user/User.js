const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto')
const userSchma = new mongoose.Schema(
    {
        firstName: {
            required: [true, 'First Name is required'],
            type: String
        },
        lastName: {
            required: [true, 'Last Name is required'],
            type: String
        },
        profilePhoto: {
            default: 'https://cdn.pixabay.com/photo/2014/04/03/11/56/avatar-312603_1280.png',
            type: String
        },
        email: {
            required: [true, 'Email is required'],
            type: String
        },
        bio: {

            type: String
        },
        password: {
            required: [true, 'Password is required'],
            type: String
        },
        postCount: {
            default: 0,
            type: Number
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        role: {
            type: String,
            enum: ['Admin', 'Guest', 'Blogger']
        },
        isFollowing: {
            type: Boolean,
            default: false
        },
        isUnFollowing: {
            type: Boolean,
            default: false
        },
        isAccountVerified: {
            type: Boolean,
            default: false
        },
        accountVerificationToken: String,
        accountVerificationTokenExpires: Date,
        viewedBy: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                }
            ]
        },
        followers: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                }
            ]
        },
        following: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                }
            ]
        },
        passwordChangedAt: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,

        active: {
            type: Boolean,
            default: false
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true
    }
);
userSchma.virtual('posts', {
    ref:'Post',
    foreignField:'user',
    localField:'_id'
})

userSchma.pre("save", async function(next){
    if(!this.isModified("password")){
        next();
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash;
    next();
});
userSchma.methods.checkPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
};
userSchma.methods.createAccountVerificationToken =  function(){
    const verifyToken  =  crypto.randomBytes(32).toString("hex");
    this.accountVerificationToken = crypto.createHash("sha256").update(verifyToken).digest("hex");
    this.accountVerificationTokenExpires =  Date.now() + 30*60*1000;
    return verifyToken;
}
userSchma.methods.createResetPassToken = function(){
    const verifyToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto.createHash("sha256").update(verifyToken).digest("hex");
    this.passwordResetExpires =  Date.now() + 30*60*1000;
    return verifyToken;
}
const User = mongoose.model('User', userSchma);
module.exports = User;