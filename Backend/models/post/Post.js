const { default: mongoose } = require("mongoose");

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Post tile is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Post category is required'],
        default: 'All'
    },
    isLiked: {
        type: Boolean,
        default: false
    },
    isDisLiked: {
        type: Boolean,
        default: false
    },
    numViews: {
        type: Number,
        default: 0
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    disLikes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please author is required']
    },
    description: {
        type: String,
        required: [true, 'Post description is required']
    },
    image: {
        type: String,
        default: 'https://pixabay.com/photos/image-8153503/ '
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
})

const Post = mongoose.model("Post", postSchema);
module.exports = Post