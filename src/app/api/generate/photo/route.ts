import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

const API_KEY = process.env.DASHSCOPE_API_KEY;
const BASE_URL = process.env.DASHSCOPE_BASE_URL;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      prompt, 
      style = 'studio', 
      variations = 1,
      size = '1024x1024' // ✅ Tambah parameter size
    } = body;

    // Validasi input
    if (!prompt?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Product description is required' },
        { status: 400 }
      );
    }

    if (!API_KEY) {
      console.error('❌ DASHSCOPE_API_KEY not configured');
      return NextResponse.json(
        { success: false, message: 'API key not configured' },
        { status: 500 }
      );
    }

    const modelName = process.env.QWEN_IMAGE_MODEL || 'qwen-image-plus';

    // ✅ Size mapping untuk Qwen-Image API
    const sizeMap: Record<string, string> = {
      '1024x1024': '1328*1328',  // Square 1:1
      '1664x928': '1664*928',    // Landscape 16:9
      '1472x1104': '1472*1104',  // Standard 4:3
      '1104x1472': '1104*1472',  // Portrait 3:4
      '928x1664': '928*1664',    // Vertical 9:16
    };
    
    const formattedSize = sizeMap[size] || '1328*1328';
    const maxVariations = Math.min(Math.max(variations, 1), 4); // Clamp 1-4

    console.log('🎨 Generating photo:', {
      model: modelName,
      prompt: prompt.substring(0, 100),
      style,
      size: formattedSize,
      variations: maxVariations
    });

    // ✅ Call Qwen-Image API
    const response = await fetch(`${BASE_URL}/services/aigc/multimodal-generation/generation`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        input: {
          messages: [
            {
              role: 'user',
              content: [
                {
                  text: prompt
                }
              ]
            }
          ]
        },
        parameters: {
          size: formattedSize,
          n: maxVariations,
          // Optional: tambahkan style ke prompt
          // prompt: `${prompt}, ${style} style, professional product photography`
        }
      })
    });

    console.log('📡 Qwen-Image API Response Status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Qwen-Image API Error:', {
        status: response.status,
        error: errorData
      });

      // Handle specific errors
      if (errorData.code === 'InvalidApiKey') {
        throw new Error('Invalid API key. Check your DASHSCOPE_API_KEY');
      }
      if (errorData.code === 'QuotaExhausted') {
        throw new Error('API quota exceeded. Try again later');
      }
      if (errorData.code === 'InvalidParameter') {
        throw new Error(`Invalid parameter: ${errorData.message || 'Check prompt and size'}`);
      }

      throw new Error(`Image generation failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📡 Qwen-Image API Response:', JSON.stringify(data, null, 2));

    // ✅ Extract image URLs dari response
    // Format response Qwen-Image: output.choices[0].message.content = array of {text, image}
    const content = data.output?.choices?.[0]?.message?.content || [];
    const resultUrls = content
      .filter((item: any) => item.image)
      .map((item: any) => item.image)
      .slice(0, maxVariations); // Ensure we don't return more than requested

    if (resultUrls.length === 0) {
      console.warn('⚠️ No images returned from API');
      // Fallback: return empty array, frontend will show empty state
    }

    console.log('✅ Generated image URLs:', resultUrls);

    // ✅ Format response yang sesuai dengan frontend expectation
    const generation = {
      id: uuidv4(),
      type: 'photo' as const,
      prompt,
      style: style || 'studio',
      status: 'completed' as const,
      resultUrls,
      thumbnailUrl: resultUrls[0] || null,
      isFavorite: false,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, generation });

  } catch (error: any) {
    console.error('❌ Photo Generation Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Failed to generate photos',
        // Optional: tambahkan hint untuk debugging
        hint: error.message?.includes('API key') 
          ? 'Check your DASHSCOPE_API_KEY in .env.local' 
          : undefined
      },
      { status: 500 }
    );
  }
}