import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { config } from '../config/config';
import { FileAsset } from '../models/FileAsset';
import { connectDB } from '../config/db';

async function seed() {
  await connectDB();
  console.log('Connected to MongoDB');

  const sample2Code = `#include <stdio.h>

int main() {
    int a = 5;
    int b = 2;
    int c = a * b;
    printf("%d", c);
    return 0;
}
`;

  const sampleCode = `#include <stdio.h>

int main() {
    float x = 4.0 / 2;
    int y = 5 / 2;
    printf("%.1f, %d\\n", x, y);
    return 0;
}
`;

  // 1. sample2.c
  await FileAsset.findOneAndUpdate(
    { filename: 'sample2-1793941751514-511112667.c' },
    {
      filename: 'sample2-1793941751514-511112667.c',
      originalName: 'sample2.c',
      fileType: 'code',
      mimeType: 'text/plain; charset=utf-8',
      size: Buffer.byteLength(sample2Code),
      codeLanguage: 'c',
      content: sample2Code,
      dataBase64: Buffer.from(sample2Code).toString('base64'),
    },
    { upsert: true, new: true }
  );
  console.log('Seeded sample2.c to MongoDB');

  // 2. sample.c
  await FileAsset.findOneAndUpdate(
    { filename: 'sample-1793940199372-652593730.c' },
    {
      filename: 'sample-1793940199372-652593730.c',
      originalName: 'sample.c',
      fileType: 'code',
      mimeType: 'text/plain; charset=utf-8',
      size: Buffer.byteLength(sampleCode),
      codeLanguage: 'c',
      content: sampleCode,
      dataBase64: Buffer.from(sampleCode).toString('base64'),
    },
    { upsert: true, new: true }
  );
  console.log('Seeded sample.c to MongoDB');

  // 3. Best.webp
  const uploadsDir = path.resolve(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const webpPath = path.join(uploadsDir, 'Best-1793842839823-372647706.webp');
  if (fs.existsSync(webpPath)) {
    const webpBuf = fs.readFileSync(webpPath);
    await FileAsset.findOneAndUpdate(
      { filename: 'Best-1793842839823-372647706.webp' },
      {
        filename: 'Best-1793842839823-372647706.webp',
        originalName: 'Best.webp',
        fileType: 'image',
        mimeType: 'image/webp',
        size: webpBuf.length,
        dataBase64: webpBuf.toString('base64'),
      },
      { upsert: true, new: true }
    );
    console.log('Seeded Best.webp to MongoDB');
  }

  // Also write to local disk
  fs.writeFileSync(path.join(uploadsDir, 'sample2-1793941751514-511112667.c'), sample2Code);
  fs.writeFileSync(path.join(uploadsDir, 'sample-1793940199372-652593730.c'), sampleCode);
  console.log('Saved to local uploads folder.');

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

