import multer from 'multer';
import path from 'path';
import fs from 'fs';

const baseUploadDir = path.join(__dirname, '../../uploads');

const configureMulter = (subDirectory: string) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(baseUploadDir, subDirectory);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });

  return multer({
    storage: storage,
  });
};

export default configureMulter;
