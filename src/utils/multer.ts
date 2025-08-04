import multer from "multer";
import path from "path";

// Define storage config
const storage = multer.diskStorage({
  destination: path.resolve("uploads"), // stores in /uploads
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sanitizedFilename = file.originalname.replace(/\s+/g, "_");
    cb(null, `${timestamp}-${sanitizedFilename}`);
  },
});

// Export configured multer instance
export const upload = multer({ storage });
