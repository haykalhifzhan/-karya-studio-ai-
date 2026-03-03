import { NextResponse } from 'next/server';

const API_KEY = process.env.DASHSCOPE_API_KEY;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, motionStyle } = body;

    if (!prompt?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!API_KEY) {
      return NextResponse.json(
        { success: false, message: 'API key not configured' },
        { status: 500 }
      );
    }

    // Call Qwen3-Max untuk enhance prompt
    const response = await fetch(`${process.env.DASHSCOPE_BASE_URL}/services/aigc/text-generation/generation`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.QWEN_MODEL || 'qwen3-max',
        input: {
          messages: [{
            role: 'user',
            content: `Enhance this video prompt to be more detailed and cinematic. Motion style: ${motionStyle || 'smooth'}. Original prompt: "${prompt}"`
          }]
        },
        parameters: {
          max_tokens: 500,
          temperature: 0.7,
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to enhance prompt');
    }

    const enhancedText = data.output?.choices?.[0]?.message?.content || prompt;

    return NextResponse.json({
      success: true,
      enhanced: enhancedText,
      original: prompt,
    });

  } catch (error: any) {
    console.error('Enhance prompt error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Failed to enhance prompt'
      },
      { status: 500 }
    );
  }
}
