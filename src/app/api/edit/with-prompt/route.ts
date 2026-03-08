import { NextResponse } from 'next/server';

// 🔥 Helper: Clean BASE_URL - hapus trailing slash & duplikat /api/v1
function getCleanBaseUrl(rawUrl: string): string {
  let url = (rawUrl || 'https://dashscope-intl.aliyuncs.com').trim();
  // Hapus trailing slash
  url = url.replace(/\/+$/, '');
  // Hapus /api/v1 jika sudah ada (kita akan tambah manual)
  url = url.replace(/\/api\/v1$/, '');
  return url;
}

// 🔥 Helper: Sanitize URL agresif (untuk imageUrl)
function sanitizeImageUrl(url: string): string {
  return url
    ?.toString()
    .trim()
    .replace(/\s+/g, '')
    .replace(/[\u00A0-\uFFFF]+/g, '')
    .replace(/^(https?):\/+/, '$1://')
    || '';
}

const API_KEY = process.env.DASHSCOPE_API_KEY?.trim();
const BASE_URL = getCleanBaseUrl(process.env.DASHSCOPE_BASE_URL || '');

// ✅ Wan2.5 Model & Endpoint (dengan /api/v1 yang kita kontrol)
const MODEL = 'wan2.5-i2i-preview';
const ENDPOINT = `${BASE_URL}/api/v1/services/aigc/image2image/image-synthesis`;

// ✅ Polling config
const MAX_POLLING_ATTEMPTS = parseInt(process.env.MAX_POLLING_ATTEMPTS || '60');
const POLLING_INTERVAL_MS = parseInt(process.env.POLLING_INTERVAL_MS || '5000');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // ✅ SANITIZE IMMEDIATELY - sebelum apa pun
    const rawImageUrl = String(body.imageUrl || '');
    const imageUrl = sanitizeImageUrl(rawImageUrl);
    const prompt = String(body.prompt || '').trim();
    let size = String(body.size || '1024x1024').trim().replace('x', '*');
    
    // ✅ Validasi minimal
    if (!imageUrl || !prompt || !API_KEY) {
      return NextResponse.json(
        { success: false, error: !imageUrl ? 'Image URL required' : !prompt ? 'Prompt required' : 'API key missing' },
        { status: 400 }
      );
    }

    // ✅ Parse size untuk Wan2.5 (format: 1024*1024)
    const [widthStr, heightStr] = size.split('*');
    const width = parseInt(widthStr, 10) || 1024;
    const height = parseInt(heightStr, 10) || 1024;

    // ✅ Log SETELAH sanitization (untuk debug yang akurat)
    console.log('🎨 Wan2.5 Image Editing Request:', {
      model: MODEL,
      endpoint: ENDPOINT,
      imageUrl: imageUrl.substring(0, 120),
      prompt: prompt.substring(0, 80),
      size: `${width}*${height}`,
    });

    // 🔥 STEP 1: Submit task (async)
    const submitResponse = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable', // ✅ WAJIB
      },
      body: JSON.stringify({
        model: MODEL,
        input: {
          prompt: prompt,
          images: [imageUrl], // ✅ Wan2.5 pakai array "images"
        },
        parameters: {
          size: `${width}*${height}`, // ✅ Format: 1024*1024
          n: 1,
          prompt_extend: true,
          watermark: false,
        },
      }),
    });

    console.log('📡 Submit Response Status:', submitResponse.status);

    if (!submitResponse.ok) {
      const errorData = await submitResponse.json().catch(() => ({}));
      console.error('❌ Submit Error:', {
        status: submitResponse.status,
        code: errorData.code,
        message: errorData.message,
        endpoint: ENDPOINT,
      });
      
      if (errorData.code === 'InvalidApiKey') {
        throw new Error('Invalid API key. Check DASHSCOPE_API_KEY');
      }
      if (errorData.code === 'InvalidParameter' && errorData.message?.includes('url')) {
        throw new Error(`Image URL error. Test in browser: ${imageUrl.substring(0, 150)}`);
      }
      if (errorData.message?.includes('not exist') || errorData.code === 'ModelNotExists') {
        throw new Error(`Model "${MODEL}" not activated. Enable in DashScope Console.`);
      }
      throw new Error(`Submit failed: ${submitResponse.statusText} (${submitResponse.status})`);
    }

    const submitData = await submitResponse.json();
    const taskId = submitData.output?.task_id;
    
    if (!taskId) {
      throw new Error('No task_id returned from submit API');
    }

    console.log('✅ Task submitted, task_id:', taskId);

    // 🔥 STEP 2: Poll for results
    const resultUrl = await pollTaskResult(taskId);
    
    if (!resultUrl) {
      throw new Error('No result URL after polling');
    }

    console.log('✅ Image editing succeeded:', resultUrl);

    return NextResponse.json({
      success: true,
      editedImageUrl: resultUrl,
      originalUrl: imageUrl,
      model: MODEL,
      size: `${width}*${height}`,
    });

  } catch (error: any) {
    console.error('❌ Image Editing Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to edit image',
        hint: error.message?.includes('URL') 
          ? 'Test OSS URL in browser: must show image, not download'
          : error.message?.includes('Model')
            ? 'Activate wan2.5-i2i-preview in DashScope Console'
            : error.message?.includes('api/v1')
              ? 'Check DASHSCOPE_BASE_URL: should NOT contain /api/v1'
              : undefined,
      },
      { status: 500 }
    );
  }
}

// 🔥 Helper: Poll task result
async function pollTaskResult(taskId: string): Promise<string | null> {
  const pollUrl = `${BASE_URL}/api/v1/tasks/${taskId}`;
  
  console.log('⏳ Starting polling for task:', taskId);
  
  for (let attempt = 1; attempt <= MAX_POLLING_ATTEMPTS; attempt++) {
    console.log(`🔄 Polling attempt ${attempt}/${MAX_POLLING_ATTEMPTS}...`);
    
    try {
      const response = await fetch(pollUrl, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
      });
      
      if (!response.ok) {
        console.warn(`⚠️ Poll ${attempt} failed: ${response.status}`);
        await sleep(POLLING_INTERVAL_MS);
        continue;
      }
      
      const data = await response.json();
      const status = data.output?.task_status;
      
      console.log(`📊 Task status: ${status}`);
      
      if (status === 'SUCCEEDED') {
        const resultUrl = data.output?.results?.[0]?.url;
        if (resultUrl) {
          console.log('✅ Task succeeded, result URL:', resultUrl.substring(0, 120));
          return resultUrl.trim();
        }
      }
      
      if (status === 'FAILED') {
        const errorMsg = data.output?.message || 'Unknown error';
        console.error('❌ Task failed:', errorMsg);
        throw new Error(`Image editing failed: ${errorMsg}`);
      }
      
      await sleep(POLLING_INTERVAL_MS);
      
    } catch (pollError: any) {
      console.warn(`⚠️ Poll ${attempt} exception:`, pollError.message);
      await sleep(POLLING_INTERVAL_MS);
    }
  }
  
  console.error('❌ Polling timeout exceeded');
  throw new Error('Image editing timeout. Please try again.');
}

// 🔥 Helper: Sleep
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}