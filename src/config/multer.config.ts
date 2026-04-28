import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

export const multerConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      let folder = 'images';

      // 🔥 route-based detection
      const url = req.originalUrl;

      if (url.includes('/profile')) {
        folder = 'profile';
      } else if (url.includes('/post')) {
        folder = 'post';
      }

      const uploadPath = `./uploads/${folder}`;

      // ✅ create folder if not exists
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      cb(null, uploadPath);
    },

    filename: (req, file, cb) => {
      const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);

      cb(null, uniqueName + extname(file.originalname));
    },
  }),
};
