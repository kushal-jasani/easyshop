const cloudinary = require('cloudinary').v2;

require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

const uploads = async (filePath) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: 'easyshop',
        })
        .then(console.log('Image upload successfully'));
        return result;
    } catch (error) {
        console.log('error while uploading to cloudinary',error.message);
    }
}

module.exports = { uploads };