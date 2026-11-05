import QRCode from 'qrcode';
import { config } from '../config/config';

export class QRService {
  /**
   * Generates a sleek, high-contrast QR code Data URL for the exam
   */
  static async generateExamQRCode(examCode: string): Promise<{
    qrCodeDataUrl: string;
    examJoinUrl: string;
  }> {
    const studentBase = config.clientStudentUrl || 'http://localhost:5174';
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

