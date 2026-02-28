import { NextResponse } from 'next/server';
import { mockGeneratedImages } from '@/lib/constants';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, style, variations = 1 } = body;

    if (!prompt) {
      return NextResponse.json({ success: false, message: 'Prompt is required' }, { status: 400 });
    }

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const count = Math.min(variations, 4);
    const shuffled = [...mockGeneratedImages].sort(() => 0.5 - Math.random());
    const resultUrls = shuffled.slice(0, count);

    const generation = {
      id: uuidv4(),
      type: 'photo' as const,
      prompt,
      style: style || 'studio',
      status: 'completed' as const,
      resultUrls,
      thumbnailUrl: resultUrls[0],
      isFavorite: false,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, generation });
  } catch {
    return NextResponse.json({ success: false, message: 'Generation failed' }, { status: 500 });
  }
}
