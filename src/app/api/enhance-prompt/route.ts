import { NextResponse } from 'next/server';

const enhancements: Record<string, string[]> = {
  lighting: ['soft studio lighting', 'golden hour natural light', 'dramatic side lighting', 'diffused window light'],
  composition: ['rule of thirds composition', 'centered symmetrical framing', 'dynamic diagonal lines', 'leading lines perspective'],
  quality: ['ultra high resolution', '4K commercial quality', 'sharp focus throughout', 'professional color grading'],
  mood: ['warm inviting atmosphere', 'clean modern aesthetic', 'luxurious premium feel', 'vibrant energetic mood'],
  detail: ['intricate texture detail visible', 'shallow depth of field bokeh', 'rich shadow details', 'highlight detail preserved'],
};

function enhancePrompt(original: string): { enhanced: string; improvements: string[] } {
  const improvements: string[] = [];
  let enhanced = original;

  const categories = Object.keys(enhancements);
  const selected = categories.sort(() => 0.5 - Math.random()).slice(0, 3);

  for (const cat of selected) {
    const options = enhancements[cat];
    const addition = options[Math.floor(Math.random() * options.length)];
    improvements.push(`Added ${cat}: "${addition}"`);
    enhanced += `, ${addition}`;
  }

  if (!enhanced.toLowerCase().includes('product photo')) {
    enhanced = `Professional product photography, ${enhanced}`;
    improvements.push('Added professional context prefix');
  }

  return { enhanced, improvements };
}

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ success: false, message: 'Prompt is required' }, { status: 400 });
    }

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const { enhanced, improvements } = enhancePrompt(prompt);

    return NextResponse.json({
      success: true,
      original: prompt,
      enhanced,
      improvements,
    });
  } catch {
    return NextResponse.json({ success: false, message: 'Enhancement failed' }, { status: 500 });
  }
}
