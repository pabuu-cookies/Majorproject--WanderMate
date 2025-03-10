/**
 * To append the file to body and also compress the files simultaneously
 * @param fieldMappings contains the variable name of the file and the body to which it should be appended
 * @param fileSize this is the maximum allowed size of the images, if not provided it has max-image-size value, if provided we can customize it: this is in consideration to the different file sizes required for normal image and the slider image
 * @returns none
 */
const appendFile = (fieldMappings) => {
  return async (req, res, next) => {
    const file = req.file;

    for (const { fileField, bodyField } of fieldMappings) {
      console.log("files", file);
      console.log("bodyfield", bodyField);
      req.body[bodyField] = file.filename;
    }

    next(); // Continue the flow after processing all fields
  };
};

module.exports = appendFile;
