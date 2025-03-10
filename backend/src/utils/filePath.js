const path = require("path");
const fs = require("fs");

// Resolve the upload path to the frontend assets folder
const uploadPath = path.join(__dirname, "../../../frontend/assets/upload");

// Ensure the upload folder exists, create it if not
const ensureUploadFolderExists = async () => {
  try {
    await fs.promises.access(uploadPath, fs.constants.F_OK);
    console.log("Upload folder already exists at:", uploadPath);
  } catch {
    await fs.promises.mkdir(uploadPath, { recursive: true });
    console.log("Upload folder created successfully at:", uploadPath);
  }
};
ensureUploadFolderExists();

module.exports = { uploadPath, ensureUploadFolderExists };
