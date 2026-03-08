// src/app/api/edit/enhance/route.ts
import { NextResponse } from 'next/server';
import { editImageWithAI } from '@/lib/image-editing';

export async function POST(request: Request) {
  try {
    const { imageUrl, size = process.env.DEFAULT_IMAGE_EDIT_SIZE } = await request.json();

    // ✅ Validasi: Image URL wajib ada
    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // 🔥 FIX: Tolak blob:/data: URLs (client-side only, tidak bisa diakses API)
    if (imageUrl.startsWith('blob:') || imageUrl.startsWith('data:')) {
      console.warn('⚠️ Received client-side URL:', imageUrl.substring(0, 100));
      return NextResponse.json(
        { 
          success: false, 
          error: 'Image URL must be a public HTTPS URL. Please upload the image to storage first.',
          hint: 'Use /api/upload endpoint to get a public OSS URL before editing'
        },
        { status: 400 }
      );
    }

    // ✅ Validasi URL format (harus HTTPS dan valid)
    try {
      const parsedUrl = new URL(imageUrl);
      if (parsedUrl.protocol !== 'https:') {
        return NextResponse.json(
          { success: false, error: 'Image URL must use HTTPS protocol' },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid image URL format' },
        { status: 400 }
      );
    }

    // ✅ Gunakan prompt dari env var dengan fallback
    const prompt = process.env.PROMPT_ENHANCE || 
      'Enhance image quality, improve sharpness, reduce noise, better lighting and colors, professional finish, high resolution';

    console.log('🎨 Image Enhancement Request:', {
      prompt: prompt.substring(0, 100),
      size,
      imageUrl: imageUrl.substring(0, 100) + '...',
    });

    // ✅ Call shared utility function
    const result = await editImageWithAI({
      imageUrl,
      prompt,
      size,
    });

    if (!result.success) {
      console.error('❌ editImageWithAI failed:', result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    console.log('✅ Image enhanced successfully:', result.editedImageUrl?.substring(0, 100));

    return NextResponse.json({
      success: true,
      enhancedUrl: result.editedImageUrl,
      originalUrl: imageUrl,
    });

  } catch (error: any) {
    console.error('❌ Image Enhancement Error:', {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to enhance image',
        ...(process.env.NODE_ENV === 'development' && { debug: error.message }),
      },
      { status: 500 }
    );
  }
}