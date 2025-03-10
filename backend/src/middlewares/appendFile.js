const { compressImageMiddleware } = require("@config/compressFile");
const { MAX_IMAGE_SIZE } = require("@config/env");
const { httpMessages } = require("@utils/HttpMessage");

/**
 * To append the file to body and also compress the files simultaneously
 * @param fieldMappings contains the variable name of the file and the body to which it should be appended
 * @param fileSize this is the maximum allowed size of the images, if not provided it has max-image-size value, if provided we can customize it: this is in consideration to the different file sizes required for normal image and the slider image
 * @returns none
 */
const appendFile = (fieldMappings, fileSize = MAX_IMAGE_SIZE) => {
  return async (req, res, next) => {
    const files = req.files;

    for (const { fileField, bodyField, isArray } of fieldMappings) {
      const file = files?.[fileField];

      if (file && Array.isArray(file) && file.length > 0) {
        const filenames = file.map((f) => f.filename);

        if (bodyField.includes(".")) {
          const keys = bodyField.split(".");
          let obj = req.body;

          keys.forEach(async (key, index) => {
            if (index === keys.length - 1) {
              obj[key] = !isArray ? filenames[0] : filenames;
              if (bodyField !== "cv" && bodyField !== "coverLetter") {
                try {
                  await compressImage(obj[key], fileSize);
                } catch (err) {
                  return next(httpMessages.BAD_REQUEST(`${err}`));
                }
              }
            } else {
              obj[key] = obj[key] || {};
              obj = obj[key];
            }
          });
        } else {
          req.body[bodyField] = !isArray ? filenames[0] : filenames;
          if (bodyField !== "cv" && bodyField !== "coverLetter") {
            try {
              // Await the compression
              await compressImage(req.body[bodyField], fileSize);
            } catch (err) {
              return next(httpMessages.BAD_REQUEST(`${err}`));
            }
          }
        }
      }
    }

    next(); // Continue the flow after processing all fields
  };
};

/**
 * Compress the image and wait for the operation to complete
 */
const compressImage = async (imageName, fileSize) => {
  try {
    if (Array.isArray(imageName)) {
      // Handle array of image names, compress them all concurrently
      await Promise.all(
        imageName.map(async (name) => {
          await compressImageMiddleware(name, fileSize);
        })
      );
    } else {
      // Handle a single image file
      await compressImageMiddleware(imageName, fileSize);
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = { appendFile };
