import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { GroqService } from '../services/groqService';
import { HuggingFaceService } from '../services/huggingFaceService';
import { MultiProviderService } from '../services/multiProviderService';
import { getFileTypeCategory, getCodeLanguage } from '../middleware/upload';

export const polishQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { questionText, remarks, options } = req.body;

    if (!questionText || questionText.trim().length === 0) {
      res.status(400).json({ success: false, message: 'Question text is required.' });
      return;
    }

    const polishResult = await GroqService.polishQuestionGrammar(questionText, remarks, options);

    res.status(200).json({
      success: true,
      result: polishResult,
    });
  } catch (error: any) {
    console.error('[AI Polish Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to polish question.' });
  }
};

export const uploadAttachmentAndAnalyze = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded.' });
      return;
    }

    const file = req.file;
    const fileCategory = getFileTypeCategory(file.originalname);
    const codeLanguage = fileCategory === 'code' ? getCodeLanguage(file.originalname) : undefined;
    let fileUrl = `/uploads/${file.filename}`;

    let visionAnalysis = null;
    let codeAnalysis = null;

    // 1. Vision & Super-Resolution with Hugging Face (Qwen2.5-VL + Swin2SR)
    if (fileCategory === 'image') {
      visionAnalysis = await HuggingFaceService.analyzeDiagramWithVision(file.path);
      if (visionAnalysis.enhancedImageUrl) {
        fileUrl = visionAnalysis.enhancedImageUrl;
      }
    }

    // 2. Code Evaluation with Qwen2.5-Coder-32B-Instruct / MultiProvider
    if (fileCategory === 'code') {
      try {
        const codeContent = fs.readFileSync(file.path, 'utf-8');
        codeAnalysis = await MultiProviderService.evaluateSourceCode(
          codeContent,
          codeLanguage || 'c',
          `Attached file: ${file.originalname}`
        );
      } catch (codeErr) {
        console.warn('[Code Analysis Error]:', codeErr);
      }
    }

    res.status(200).json({
      success: true,
      file: {
        originalName: file.originalname,
        filename: file.filename,
        fileType: fileCategory,
        url: fileUrl,
        size: file.size,
        codeLanguage,
      },
      visionAnalysis,
      codeAnalysis,
    });
  } catch (error: any) {
    console.error('[Upload & Analyze Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to upload and analyze file.' });
  }
};
