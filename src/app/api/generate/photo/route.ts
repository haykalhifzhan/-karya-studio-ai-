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

// ✅ Model untuk text-to-image (tanpa reference)
const TEXT_TO_IMAGE_MODEL = process.env.WAN_T2I_MODEL || 'wan2.6-t2i';
// ✅ Model untuk image editing (dengan reference)
const IMAGE_TO_IMAGE_MODEL = process.env.WAN_26_IMAGE_MODEL || 'wan2.6-image';

const ENDPOINT = `${BASE_URL}/api/v1/services/aigc/multimodal-generation/generation`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      prompt,
      style = 'studio',
      variations,
      size = '1024x1024',
      referenceImageUrl
    } = body;

    // Validasi minimal
    if (!prompt?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Product description is required' },
        { status: 400 }
      );
    }
    if (!API_KEY) {
      return NextResponse.json(
        { success: false, message: 'API key not configured' },
        { status: 500 }
      );
    }

    // ✅ Sanitize reference URL (bisa null)
    const refUrl = referenceImageUrl ? cleanUrl(referenceImageUrl) : null;
    const hasReference = !!refUrl;

    // 🔥 DYNAMIC MODEL & SIZE SELECTION
    const modelName = hasReference ? IMAGE_TO_IMAGE_MODEL : TEXT_TO_IMAGE_MODEL;

    // Size mapping untuk wan2.6-t2i (text-to-image)
    const t2iSizeMap: Record<string, string> = {
      '1024x1024': '1280*1280',
      '1664x928': '1696*960',
      '1472x1104': '1472*1104',
      '1104x1472': '1104*1472',
      '928x1664': '960*1696',
    };

    // Size mapping untuk wan2.6-image (image editing)
    const i2iSizeMap: Record<string, string> = {
      '1024x1024': '1K',
      '1664x928': '1K',
      '1472x1104': '1K',
      '1104x1472': '1K',
      '928x1664': '1K',
    };

    const formattedSize = hasReference
      ? i2iSizeMap[size] || '1K'
      : t2iSizeMap[size] || '1280*1280';

    const n = Math.min(Math.max(variations, 1), 4);

    console.log('🎨 Photo Gen Request:', {
      model: modelName,
      hasReference,
      refUrl: refUrl?.slice(0, 100),
      size: formattedSize,
      variations: n,
    });

    // ✅ Enhanced prompt dengan style
    const enhancedPrompt = style !== 'studio'
      ? `${prompt}, ${style} style, professional product photography, high quality`
      : prompt;

    // 🔥 BUILD CONTENT ARRAY - Conditional based on hasReference
    const content: Array<{ type: string; text?: string; image?: string }> = [];

    // ✅ Selalu tambahkan text prompt dulu
    content.push({ type: 'text', text: enhancedPrompt });

    // ✅ Tambahkan reference image jika ada
    if (refUrl) {
      content.push({ type: 'image', image: refUrl });
    }

    // 🔥 SET enable_interleave berdasarkan apakah ada reference image
    // ✅ hasReference=true → enable_interleave=false (image editing mode)
    // ✅ hasReference=false → enable_interleave=true (text-to-image mode)
    const enableInterleave = !hasReference;

    // 🔥 CALL WAN2.6 API
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        input: {
          messages: [{ role: 'user', content }],
        },
        parameters: {
          enable_interleave: enableInterleave,
          size: formattedSize,
          n: hasReference ? n : 1,  // ✅ n=1 jika text-to-image mode (wan2.6-t2i requirement)
          prompt_extend: true,
          watermark: false,
        },
      }),
    });

    console.log('📡 API Status:', response.status);

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('❌ API Error:', {
        status: response.status,
        code: err.code,
        msg: err.msg || err.message,
        endpoint: ENDPOINT,
      });

      if (err.code === 'ModelNotExists' || err.message?.includes('not exist')) {
        throw new Error(`Model "${modelName}" not activated. Enable in DashScope Console.`);
      }
      if (err.message?.includes('url') || err.message?.includes('image')) {
        throw new Error(`Image error: ${err.msg || err.message}. URL: ${refUrl?.slice(0, 120)}`);
      }
      throw new Error(`Generation failed: ${response.statusText} (${response.status})`);
    }

    const data = await response.json();
    console.log('✅ API Response:', {
      request_id: data.request_id,
      hasOutput: !!data.output,
    });

    // ✅ Extract image URLs dari response
    // Format: output.choices[0].message.content[] dengan type: "image"
    const contentArray = data.output?.choices?.[0]?.message?.content || [];
    const urls = contentArray
      .filter((i: any) => i.type === 'image' && i.image)
      .map((i: any) => i.image.trim())
      .slice(0, hasReference ? n : 1);

    console.log('✅ Extracted URLs:', urls);

    if (urls.length === 0) {
      console.warn('⚠️ No image URLs found. Full output:', JSON.stringify(data.output, null, 2).slice(0, 500));
      throw new Error('No image generated from API');
    }

    return NextResponse.json({
      success: true,
      generation: {
        id: uuidv4(),
        type: 'photo' as const,
        prompt,
        style,
        status: 'completed' as const,
        resultUrls: urls,
        thumbnailUrl: urls[0] || null,
        isFavorite: false,
        createdAt: new Date().toISOString(),
        referenceImageUrl: refUrl,
      },
    });

  } catch (error: any) {
    console.error('❌ Photo Gen Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to generate photos',
        hint: error.message?.includes('URL')
          ? 'Test reference image URL in browser: must show image, not download'
          : error.message?.includes('Model')
            ? 'Activate wan2.6-t2i or wan2.6-image in DashScope Console: https://dashscope.console.aliyun.com/model-studio'
            : undefined,
      },
      { status: 500 }
    );
  }
}