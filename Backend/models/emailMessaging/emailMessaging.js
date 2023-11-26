const { default: mongoose } = require("mongoose");

const emailSchema = new mongoose.Schema({
    fromEmail:{
        type: String,
        required: true
    },
    toEmail:{
        type: String,
        required: true
    },
    message:{
        type: String,
        required: true
    },
    subject:{
        type: String,
        required: true
    },
    sendBy:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'User'
    },
    isFlag:{
        type: Boolean,
        default:false
    }
}, {timestamps:true})

const email = mongoose.model("EmailMsg", emailSchema)
module.exports = email