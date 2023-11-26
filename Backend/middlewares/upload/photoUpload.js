const multer = require('multer')
const mutlerStorage = multer.memoryStorage();
const sharp = require('sharp')
const path = require('path')
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true)
    } else {
        cb({ message: "not support this file format" }, false)
    }
}

const PhotoUpload = multer({
    storage: mutlerStorage,
    fileFilter: multerFilter,
    limits: { fileSize: 1000000 }
})

const profilePhotoResizing = async (req, res, next) => {
    if (!(req.file)) {next();}
    req.file.filename = `user-${Date.now()}-${req.file.originalname}`;
    await sharp(req.file.buffer)
        .resize(250, 250)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(path.join(`public/images/profile/${req.file.filename}`));
    next();
}
const postImgResizing = async (req, res, next) => {
    
    if (typeof(req.file) === 'undefined'){ next();}
    else{
        req.file.filename = `user-${Date.now()}-${req.file?.originalname}`;
        await sharp(req.file.buffer)
            .resize(500, 500)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(path.join(`public/images/posts/${req.file.filename}`)); 
        next();

    }
}
module.exports = { PhotoUpload, profilePhotoResizing, postImgResizing }