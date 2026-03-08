// src/app/api/edit/remove-bg/route.ts
import { NextResponse } from 'next/server';
import { editImageWithAI } from '@/lib/image-editing';

export async function POST(request: Request) {
  try {
    const { imageUrl, size = process.env.DEFAULT_IMAGE_EDIT_SIZE } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Gunakan prompt dari env var
    const prompt = process.env.PROMPT_REMOVE_BG || 'Remove background completely, keep only the main subject with clean edges, transparent or white background';

    const result = await editImageWithAI({
      imageUrl,
      prompt,
      size,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      noBgUrl: result.editedImageUrl,
    });

  } catch (error: any) {
    console.error('❌ Background Removal Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to remove background' },
      { status: 500 }
    );
  }
}