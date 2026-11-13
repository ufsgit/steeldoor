import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure the root uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const cleanOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}-${cleanOriginalName}`);
  }
});

// File filter for images, pdfs, documents, videos, and other files
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.pdf', '.doc', '.docx', '.txt', '.mp4', '.mov', '.webm', '.avi', '.mkv', '.xls', '.xlsx', '.csv'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext) || file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Supported types: ${allowedExtensions.join(', ')}`), false);
  }
};

export const FILE_LIMITS_MB = {
  IMAGE: Number(process.env.MAX_IMAGE_SIZE_MB) || Number(process.env.MAX_FILE_SIZE_MB) || 10,
  PDF: Number(process.env.MAX_PDF_SIZE_MB) || Number(process.env.MAX_FILE_SIZE_MB) || 10,
  VIDEO: Number(process.env.MAX_VIDEO_SIZE_MB) || Number(process.env.MAX_FILE_SIZE_MB) || 10,
  OTHERS: Number(process.env.MAX_OTHERS_SIZE_MB) || Number(process.env.MAX_OTHER_SIZE_MB) || Number(process.env.MAX_DOCUMENT_SIZE_MB) || Number(process.env.MAX_FILE_SIZE_MB) || 10
};

export const getBackendFileCategory = (filename = '', mimetype = '') => {
  const ext = path.extname(filename).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext) || mimetype.startsWith('image/')) {
    return { label: 'Image', limitMb: FILE_LIMITS_MB.IMAGE };
  }
  if (ext === '.pdf' || mimetype === 'application/pdf') {
    return { label: 'PDF', limitMb: FILE_LIMITS_MB.PDF };
  }
  if (['.mp4', '.mov', '.webm', '.avi', '.mkv'].includes(ext) || mimetype.startsWith('video/')) {
    return { label: 'Video', limitMb: FILE_LIMITS_MB.VIDEO };
  }
  return { label: 'Other file', limitMb: FILE_LIMITS_MB.OTHERS };
};

// Returns error message if any file exceeds its category limit from .env
export const validateUploadedFiles = (files) => {
  if (!files || !Array.isArray(files)) return null;
  for (const f of files) {
    const category = getBackendFileCategory(f.originalname, f.mimetype);
    const maxBytes = category.limitMb * 1024 * 1024;
    if (f.size > maxBytes) {
      return `${category.label} limit is ${category.limitMb} MB`;
    }
  }
  return null;
};

export const MAX_FILE_SIZE_MB = Math.max(
  FILE_LIMITS_MB.IMAGE,
  FILE_LIMITS_MB.PDF,
  FILE_LIMITS_MB.VIDEO,
  FILE_LIMITS_MB.OTHERS
);
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const MAX_FILE_SIZE_ERROR = `File limit is ${MAX_FILE_SIZE_MB} MB`;

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES
  }
});
