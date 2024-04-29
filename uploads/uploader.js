const { fileupload } = require('../uploads/cloudinary');

const uploader = async (folder,...files) => {
    const urls = [];

    for (let file of files) {
        try{
       
        const isImage=file.mimetype.startsWith('image');
        const isVideo=file.mimetype.startsWith('video');

        if(isImage){
            const imageResult=await fileupload(file.path,{resource_type: "image",folder: folder })
            urls.push(imageResult.secure_url);
        }
        else if(isVideo){
            const videoResult=await fileupload(file.path,{resource_type: "video",folder: folder })
            urls.push(videoResult.secure_url);
        }
    }catch(error){
        console.error('Error uploading file:', error.message);
        urls.push(null);
    }
        // const img_newPath = await uploads(img);
        // let img_url = (img_newPath && img_newPath.secure_url) || ""
        // urls.push(img_url);
    }
    return urls;
};

module.exports = { uploader }