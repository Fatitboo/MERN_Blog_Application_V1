const { default: mongoose } = require("mongoose");

const cmtSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: [true, 'Post is required']
    },
    user: {
        type: Object,
        required: [true, 'User is required']
    },
    description: {
        type: String,
        required: [true, 'description is required']
    }
}, { timestamps: true })

const Comment = mongoose.model("Comment", cmtSchema);
module.exports = Comment;