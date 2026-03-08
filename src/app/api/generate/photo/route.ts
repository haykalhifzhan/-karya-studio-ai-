import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// 🔥 Helper: Clean BASE_URL
function getCleanBaseUrl(raw: string): string {
  return (raw || 'https://dashscope-intl.aliyuncs.com')
    .trim().replace(/\/+$/, '').replace(/\/api\/v1$/, '');
}

// 🔥 Helper: Aggressive URL sanitization
function cleanUrl(url: string): string {
  return url?.toString().trim().replace(/\s+/g, '').replace(/[\u00A0-\uFFFF]+/g, '') || '';
}

const API_KEY = process.env.DASHSCOPE_API_KEY?.trim();
const BASE_URL = getCleanBaseUrl(process.env.DASHSCOPE_BASE_URL || '');
const MODEL = process.env.WAN_26_IMAGE_MODEL || 'wan2.6-image';
const ENDPOINT = `${BASE_URL}/api/v1/services/aigc/multimodal-generation/generation`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, style = 'studio', variations = 1, size = '1024x1024', referenceImageUrl } = body;

    if (!prompt?.trim() && !referenceImageUrl) {
      return NextResponse.json({ success: false, message: 'Prompt or reference image required' }, { status: 400 });
    }
    if (!API_KEY) {
      return NextResponse.json({ success: false, message: 'API key missing' }, { status: 500 });
    }

    // ✅ Sanitize reference URL
    const refUrl = referenceImageUrl ? cleanUrl(referenceImageUrl) : null;
    
    // ✅ Size mapping untuk wan2.6-image (pakai 1K/2K atau custom)
    const sizeMap: Record<string, string> = {
      '1024x1024': '1K', '1664x928': '1K', '1472x1104': '1K',
      '1104x1472': '1K', '928x1664': '1K',
    };
    const formattedSize = sizeMap[size] || '1K';
    const n = Math.min(Math.max(variations, 1), 4);

    console.log('🎨 Photo Gen (wan2.6-image):', { model: MODEL, hasRef: !!refUrl, size: formattedSize });

    // ✅ Enhanced prompt dengan style
    const enhancedPrompt = style !== 'studio' 
      ? `${prompt}, ${style} style, professional product photography, high quality`
      : prompt;

    // ✅ Build content array: TEXT dulu, lalu IMAGE (urutan penting untuk wan2.6)
    const content: any[] = [{ type: 'text', text: enhancedPrompt }];
    if (refUrl) {
      content.push({ type: 'image', image: refUrl });
    }

    // ✅ Call wan2.6-image API (sync mode - lebih simple)
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${API_KEY}`, 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        input: {
          messages: [{ role: 'user', content }],
        },
        parameters: {
          enable_interleave: false,  // ✅ Image editing mode (bukan text+image output)
          size: formattedSize,
          n: n,
          prompt_extend: true,
          watermark: false,
        },
      }),
    });

    console.log('📡 API Status:', response.status);

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('❌ API Error:', { status: response.status, code: err.code, msg: err.message });
      
      if (err.code === 'ModelNotExists' || err.message?.includes('not exist')) {
        throw new Error(`Model "${MODEL}" not activated. Enable in DashScope Console.`);
      }
      if (err.message?.includes('url')) {
        throw new Error(`Reference URL error. Check: 1) Public HTTPS, 2) OSS ACL=public-read. URL: ${refUrl?.slice(0, 120)}`);
      }
      throw new Error(`Generation failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ API Response:', { request_id: data.request_id, hasOutput: !!data.output });

    // ✅ Extract image URLs dari response wan2.6-image
    // Format: output.choices[0].message.content[] dengan type: "image"
    const contentArray = data.output?.choices?.[0]?.message?.content || [];
    const urls = contentArray
      .filter((i: any) => i.type === 'image' && i.image)
      .map((i: any) => i.image.trim())
      .slice(0, n);

    console.log('✅ Extracted URLs:', urls);

    if (urls.length === 0) {
      console.warn('⚠️ No image URLs found. Full output:', JSON.stringify(data.output, null, 2).slice(0, 500));
    }

    return NextResponse.json({
      success: true,
      generation: {
        id: uuidv4(), type: 'photo', prompt, style, status: 'completed',
        resultUrls: urls, thumbnailUrl: urls[0] || null,
        isFavorite: false, createdAt: new Date().toISOString(), referenceImageUrl: refUrl,
      },
    });

  } catch (error: any) {
    console.error('❌ Photo Gen Error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed' }, { status: 500 });
  }
}