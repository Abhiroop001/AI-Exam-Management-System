import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

export const getFileTypeCategory = (filename: string): 'image' | 'pdf' | 'excel' | 'code' | 'other' => {
  const ext = path.extname(filename).toLowerCase();
  if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(ext)) return 'image';
  if (ext === '.pdf') return 'pdf';
  if (['.xls', '.xlsx', '.csv'].includes(ext)) return 'excel';
  if (['.c', '.cpp', '.py', '.java', '.js', '.ts', '.html', '.css', '.json', '.sql', '.sh', '.rs', '.go', '.php'].includes(ext)) {
    return 'code';
  }
  return 'other';
};

export const getCodeLanguage = (filename: string): string => {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.c': return 'c';
    case '.cpp': return 'cpp';
    case '.py': return 'python';
    case '.java': return 'java';
    case '.js': return 'javascript';
    case '.ts': return 'typescript';
    case '.html': return 'html';
    case '.css': return 'css';
    case '.json': return 'json';
    case '.sql': return 'sql';
    case '.sh': return 'bash';
    case '.rs': return 'rust';
    case '.go': return 'go';
    case '.php': return 'php';
    default: return 'plaintext';
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max limit
  },
});

