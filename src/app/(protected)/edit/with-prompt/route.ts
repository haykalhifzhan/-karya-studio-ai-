// src/app/api/edit/with-prompt/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { imageUrl, prompt, size = '1024x1024' } = await request.json();

    // Validasi
    if (!imageUrl || !prompt?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Image URL and prompt are required' },
        { status: 400 }
      );
    }

    // Parse size
    const [width, height] = size.split('x').map(Number);
    
    // Validasi resolusi (min 512x512, max 2048x2048)
    if (width < 512 || height < 512 || width > 2048 || height > 2048) {
      return NextResponse.json(
        { success: false, error: 'Resolution must be between 512x512 and 2048x2048' },
        { status: 400 }
      );
    }

    console.log('🎨 Editing image:', {
      model: 'qwen-image-edit-max',
      prompt,
      size: `${width}x${height}`,
    });

    // Call Qwen Image Editing API
    // Endpoint: https://help.aliyun.com/zh/dashscope/image-editing
    const response = await fetch(`${process.env.DASHSCOPE_BASE_URL}/api/v1/services/aigc/image-editing`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DASHSCOPE_API_KEY}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable',
      },
      body: JSON.stringify({
        model: 'qwen-image-edit-max', // atau 'qwen-image-2.0-pro'
        input: {
          // Input image yang akan diedit
          image: imageUrl,
          // Instruksi editing dalam bahasa natural
          prompt: prompt.trim(),
        },
        parameters: {
          // Output resolution
          width: width,
          height: height,
          // Number of output images (1-6)
          n: 1,
          // Output format
          output_format: 'png',
        },
      }),
    });

    console.log('📡 Qwen API Response Status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Qwen Image Editing Error:', errorData);
      
      throw new Error(errorData.message || `API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Qwen API Response:', JSON.stringify(data, null, 2));

    // Parse hasil
    // Format response: data.output.results[0].url atau data.output.image
    const editedImageUrl = 
      data.output?.results?.[0]?.url || 
      data.output?.image || 
      data.output?.images?.[0];

    if (!editedImageUrl) {
      throw new Error('No image URL in response');
    }

    return NextResponse.json({
      success: true,
      editedImageUrl,
      originalUrl: imageUrl,
      model: 'qwen-image-edit-max',
    });

  } catch (error: any) {
    console.error('❌ Image Editing Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to edit image',
      },
      { status: 500 }
    );
  }
}
