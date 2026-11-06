import QRCode from 'qrcode';
import { config } from '../config/config';

export class QRService {
  /**
   * Generates a sleek, high-contrast QR code Data URL for the exam
   */
  static async generateExamQRCode(
    examCode: string,
    customStudentBase?: string
  ): Promise<{
    qrCodeDataUrl: string;
    examJoinUrl: string;
  }> {
    let studentBase = customStudentBase?.trim();
    if (!studentBase) {
      if (
        process.env.RENDER ||
        config.nodeEnv === 'production' ||
        (config.clientStudentUrl && !config.clientStudentUrl.includes('localhost'))
      ) {
        studentBase = config.clientStudentUrl && !config.clientStudentUrl.includes('localhost')
          ? config.clientStudentUrl
          : 'https://frontend-student-nu.vercel.app';
      } else {
        studentBase = config.clientStudentUrl || 'http://localhost:5174';
      }
    }
    // Remove trailing slash if present
    studentBase = studentBase.replace(/\/+$/, '');
    const examJoinUrl = `${studentBase}/exam/${examCode}`;

    try {
      const qrCodeDataUrl = await QRCode.toDataURL(examJoinUrl, {
        errorCorrectionLevel: 'H',
        margin: 2,
        scale: 8,
        color: {
          dark: '#0f172a', // Deep slate for crisp scanning
          light: '#ffffff',
        },
      });

      return {
        qrCodeDataUrl,
        examJoinUrl,
      };
    } catch (err) {
      console.error('[QR Code Generation Error]:', err);
      // Fallback simple svg/url
      return {
        qrCodeDataUrl: '',
        examJoinUrl,
      };
    }
  }
}

