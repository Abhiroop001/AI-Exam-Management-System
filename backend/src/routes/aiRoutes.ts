import { Router } from 'express';
import { polishQuestion, uploadAttachmentAndAnalyze } from '../controllers/aiController';
import { upload } from '../middleware/upload';

const router = Router();

// AI grammar & question clarity polishing
router.post('/polish', polishQuestion);
router.post('/check-grammar', polishQuestion);

// File attachment upload with vision quality check
router.post('/upload', upload.single('file'), uploadAttachmentAndAnalyze);

export default router;

