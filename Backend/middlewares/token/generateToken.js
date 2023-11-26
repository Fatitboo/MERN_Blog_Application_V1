const jwt = require('jsonwebtoken')
const generateTokenJwt = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "10d"
    })
}
module.exports = generateTokenJwt;