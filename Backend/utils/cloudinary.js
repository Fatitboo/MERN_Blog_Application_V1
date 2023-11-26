const cloudinary = require('cloudinary')
require("dotenv").config()
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUD_KEY, 
  api_secret: process.env.CLOUD_SECRET_KEY
});

const cloudinaryUploadImage = async(fileToUpload)=>{
    try {
        const data = await cloudinary.v2.uploader.upload(fileToUpload, {resource_type:"auto"})
        return {
            url: data?.secure_url
        }
    } catch (error) {
        return error
    }
}


module.exports=cloudinaryUploadImage