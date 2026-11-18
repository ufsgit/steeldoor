import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Resolve uploads/brochures path whether executed from root or Backend/
const resolveBrochuresDir = () => {
  const backendBrochures = path.join(process.cwd(), 'Backend', 'uploads', 'brochures');
  const rootBrochures = path.join(process.cwd(), 'uploads', 'brochures');

  if (fs.existsSync(path.join(process.cwd(), 'Backend', 'uploads'))) {
    if (!fs.existsSync(backendBrochures)) {
      fs.mkdirSync(backendBrochures, { recursive: true });
    }
    return backendBrochures;
  }

  if (!fs.existsSync(rootBrochures)) {
    fs.mkdirSync(rootBrochures, { recursive: true });
  }
  return rootBrochures;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const targetDir = resolveBrochuresDir();
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const cleanOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}-${cleanOriginalName}`);
  }
});

// Strict whitelist: Only PDF documents, Word documents, and images. Videos and other formats strictly prohibited.
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.webp'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp'
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimetype = (file.mimetype || '').toLowerCase();

  // 1. Explicitly reject video files
  if (
    mimetype.startsWith('video/') ||
    ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv', '.wmv', '.3gp', '.m4v'].includes(ext)
  ) {
    return cb(new Error('Videos are strictly not allowed for brochures. Only PDF, DOC/DOCX, and images are permitted.'), false);
  }

  // 2. Explicitly reject audio, archives, and executables
  if (
    mimetype.startsWith('audio/') ||
    ['.zip', '.rar', '.7z', '.tar', '.gz', '.exe', '.bat', '.sh', '.apk'].includes(ext)
  ) {
    return cb(new Error('Invalid file format. Only PDF, DOC/DOCX, and images are permitted.'), false);
  }

  // 3. Check allowed extensions and MIME types
  const hasValidExt = ALLOWED_EXTENSIONS.includes(ext);
  const hasValidMime = ALLOWED_MIME_TYPES.includes(mimetype) || (mimetype.startsWith('image/') && hasValidExt);

  if (hasValidExt && hasValidMime) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed. Supported formats: PDF, DOC, DOCX, JPG, PNG, WEBP.'), false);
  }
};

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit for brochures

export const brochureUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES
  }
});

