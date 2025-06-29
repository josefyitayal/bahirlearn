import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get('file')

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: 'websites' }, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      })
      .end(buffer);
  });

  return NextResponse.json({ url: result.secure_url });
}