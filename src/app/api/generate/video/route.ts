import { NextResponse } from 'next/server';
import { mockGeneratedImages, mockVideoUrl } from '@/lib/constants';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageUrl, motionStyle, duration } = body;

    if (!imageUrl) {
      return NextResponse.json({ success: false, message: 'Image is required' }, { status: 400 });
    }

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const generation = {
      id: uuidv4(),
      type: 'video' as const,
      prompt: `Video from image with ${motionStyle} effect, ${duration}s duration`,
      style: motionStyle || 'zoom-in',
      status: 'completed' as const,
      resultUrls: [mockVideoUrl],
      thumbnailUrl: mockGeneratedImages[Math.floor(Math.random() * mockGeneratedImages.length)],
      videoUrl: mockVideoUrl,
      isFavorite: false,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, generation });
  } catch {
    return NextResponse.json({ success: false, message: 'Video generation failed' }, { status: 500 });
  }
}
