const mongoose = require('mongoose')
const validationId = id => {
    const valid = mongoose.Types.ObjectId.isValid(id);
    if (!valid) {
        throw new Error("User id is not valid or found");
    }
}

module.exports = validationId;