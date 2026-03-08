export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import OSS from 'ali-oss';
import { v4 as uuidv4 } from 'uuid';

// 🔥 Helper: Aggressive sanitization
function sanitizeString(str: string): string {
  if (!str) return '';
  return str
    .trim()
    .replace(/\s+/g, '')
    .replace(/[\u00A0-\uFFFF]+/g, '')
    .replace(/[^\x20-\x7E]/g, '');
}

// 🔥 Helper: Sanitize filename
function sanitizeFilename(filename: string): { name: string; extension: string } {
  let cleaned = sanitizeString(filename);
  const parts = cleaned.split('.');
  let extension = 'jpg';
  
  if (parts.length > 1) {
    const ext = parts.pop()?.toLowerCase() || '';
    extension = ext.replace(/[^a-z0-9]/g, '') || 'jpg';
  }
  
  const validExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  if (!validExts.includes(extension)) extension = 'jpg';
  
  return { name: cleaned, extension };
}

// 🔥 Helper: Build clean OSS URL
function buildCleanOSSUrl(bucket: string, region: string, filename: string): string {
  const cleanBucket = sanitizeString(bucket);
  const cleanRegion = sanitizeString(region);
  const cleanFilename = sanitizeString(filename);
  const url = new URL(`https://${cleanBucket}.${cleanRegion}.aliyuncs.com/${cleanFilename}`);
  return sanitizeString(url.toString());
}

export async function POST(request: Request) {
  try {
    // ✅ Validasi env vars - HARUS ada semua
    const OSS_REGION = sanitizeString(process.env.OSS_REGION || '');
    const OSS_ACCESS_KEY_ID = process.env.OSS_ACCESS_KEY_ID;
    const OSS_ACCESS_KEY_SECRET = process.env.OSS_ACCESS_KEY_SECRET;
    const OSS_BUCKET = sanitizeString(process.env.OSS_BUCKET || '');

    if (!OSS_REGION || !OSS_ACCESS_KEY_ID || !OSS_ACCESS_KEY_SECRET || !OSS_BUCKET) {
      console.error('❌ OSS environment variables missing:', {
        hasRegion: !!OSS_REGION,
        hasKeyId: !!OSS_ACCESS_KEY_ID,
        hasKeySecret: !!OSS_ACCESS_KEY_SECRET,
        hasBucket: !!OSS_BUCKET,
      });
      return NextResponse.json(
        { success: false, message: 'OSS environment variables are missing' },
        { status: 500 }
      );
    }

    const region = OSS_REGION.startsWith('oss-') ? OSS_REGION : `oss-${OSS_REGION}`;

    // Init OSS client
    const client = new OSS({
      region,
      accessKeyId: OSS_ACCESS_KEY_ID,
      accessKeySecret: OSS_ACCESS_KEY_SECRET,
      bucket: OSS_BUCKET,
      secure: true,
    });

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, message: 'Only image files are allowed' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: 'File size must be less than 10MB' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { extension: cleanExtension } = sanitizeFilename(file.name);
    const filename = `uploads/${uuidv4()}.${cleanExtension}`;
    const baseFilename = filename.split('/').pop() || filename;

    console.log('📤 Uploading to OSS:', {
      originalName: file.name,
      sanitizedFilename: filename,
      contentType: file.type,
      size: file.size,
    });

    // 🔥 UPLOAD KE OSS - SIMPLIFIED (tanpa client.copy yang error)
    await client.put(filename, buffer, {
      headers: {
        'Content-Type': file.type,
        'Content-Disposition': `inline; filename="${baseFilename}"`,
        'x-oss-object-acl': 'public-read',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });

    // 🔥 Build URL yang clean
    const url = buildCleanOSSUrl(OSS_BUCKET, region, filename);

    // 🔍 Debug log
    console.log('✅ Upload success:', {
      filename,
      urlLength: url.length,
      urlStart: url.substring(0, 80),
      hasTrailingSpace: url.endsWith(' '),
    });

    // ✅ Return response
    return NextResponse.json({ 
      success: true, 
      url: sanitizeString(url),
      filename,
      contentType: file.type,
      size: file.size,
    });

  } catch (error: any) {
    console.error('❌ OSS Upload Error:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Upload failed',
        ...(process.env.NODE_ENV === 'development' && { 
          debug: { message: error.message, code: error.code, name: error.name } 
        }),
      },
      { status: 500 }
    );
  }
}