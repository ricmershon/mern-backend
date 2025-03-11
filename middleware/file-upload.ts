import multer from "multer";
import { v4 as uuidv4 } from 'uuid';

const MIME_TYPE_MAP: { [key: string]: string } = {
    'image/png': 'png',
    'image/jpeg': 'png',
    'image/jpg': 'jpg'
}

const fileUpload = multer({
    limits: {
        fileSize: 500000
    },
    storage: multer.diskStorage({
        destination: (_req, _file, cb) => {
            cb(null, 'uploads/images');
        },
        filename: (_req, file, cb) => {
            const fileExtension = MIME_TYPE_MAP[file.mimetype];
            cb(null, `${uuidv4()}.${fileExtension}`);
        }
    }),
    fileFilter: (_req, file, cb) => {
        const isValid = !!MIME_TYPE_MAP[file.mimetype];
        cb(null, isValid);
    }
});

export default fileUpload;