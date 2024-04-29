const cloudinary = require("cloudinary").v2;
const fs = require("fs");

require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const fileupload = async (filePath,options) => {
  try {
    const stats = fs.statSync(filePath);
    const fileSizeInBytes = stats.size;
    const maxSizeInBytes = 10485760;
    if (fileSizeInBytes > maxSizeInBytes) {
      throw new Error("File size too large. Maximum is 10MB.");
    }

    const result = await cloudinary.uploader.upload(filePath,options);
    console.log("File uploaded successfully");
    return result;
  } catch (error) {
    console.log("error while uploading to cloudinary", error.message);
    throw error;
  }
};

module.exports = { fileupload};
