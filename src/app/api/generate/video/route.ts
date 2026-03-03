import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

const API_KEY = process.env.DASHSCOPE_API_KEY;
const BASE_URL = process.env.DASHSCOPE_BASE_URL;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      imageUrl, 
      prompt = '', 
      motionStyle = 'smooth', 
      duration = 5,
      aspectRatio = '1280*720'
    } = body;

    // Validasi input
    if (!imageUrl?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Image URL is required' },
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

    const modelName = process.env.WAN_I2V_MODEL || 'wan2.2-kf2v-flash';

    // Sanitize URL
    const sanitizedImageUrl = imageUrl.trim().replace(/\s+/g, '');

    console.log('🎬 Generating video:', {
      model: modelName,
      imageUrl: sanitizedImageUrl.substring(0, 100),
      prompt: prompt.substring(0, 100),
      motionStyle,
      duration,
      aspectRatio
    });

    const videoUrl = await generateImageToVideo(
      sanitizedImageUrl,
      prompt,
      motionStyle,
      duration,
      aspectRatio,
      modelName
    );

    const generation = {
      id: uuidv4(),
      type: 'video' as const,
      prompt: prompt || `Video with ${motionStyle} motion`,
      style: motionStyle,
      status: 'completed' as const,
      resultUrls: [videoUrl],
      thumbnailUrl: sanitizedImageUrl,
      videoUrl,
      isFavorite: false,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, generation });

  } catch (error: any) {
    console.error('❌ Video Generation Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Video generation failed',
        hint: error.message?.includes('API key') 
          ? 'Check your DASHSCOPE_API_KEY in .env.local' 
          : undefined
      },
      { status: 500 }
    );
  }
}

async function generateImageToVideo(
  imageUrl: string,
  prompt: string,
  motionStyle: string,
  duration: number,
  aspectRatio: string,
  modelName: string
): Promise<string> {
  const apiKey = process.env.DASHSCOPE_API_KEY!;
  const baseUrl = process.env.DASHSCOPE_BASE_URL!;

  const enhancedPrompt = prompt
    ? `${prompt}, ${motionStyle} motion, cinematic quality, professional, 4k`
    : `${motionStyle} motion, cinematic quality, professional, 4k`;

  const sizeMap: Record<string, string> = {
    '1280*720': '720P',
    '1920*1080': '1080P',
    '640*480': '480P',
  };
  
  const outputSize = sizeMap[aspectRatio] || '720P';

  const isKf2v = modelName.includes('kf2v');
  const endpoint = isKf2v 
    ? `${baseUrl}/services/aigc/image2video/video-synthesis`
    : `${baseUrl}/services/aigc/video-generation/video-synthesis`;

  const input = isKf2v 
    ? { first_frame_url: imageUrl, prompt: enhancedPrompt }
    : { img_url: imageUrl, prompt: enhancedPrompt };

  const parameters: Record<string, unknown> = { resolution: outputSize };
  if (!isKf2v) {
    parameters.duration = duration;
  }

  const requestBody = { 
    model: modelName, 
    input, 
    parameters 
  };

  console.log('📡 Calling endpoint:', endpoint);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-DashScope-Async': 'enable'
    },
    body: JSON.stringify(requestBody)
  });

  console.log('📡 API Response Status:', response.status);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('❌ Video API Error:', {
      status: response.status,
      error: errorData,
      requestedUrl: imageUrl
    });
    
    if (errorData.code === 'ModelNotExists' || errorData.message?.includes('not exist')) {
      throw new Error(`Model "${modelName}" not found. Activate in Model Studio console.`);
    }
    
    if (errorData.code === 'InvalidParameter' && errorData.message?.includes('url')) {
      throw new Error(
        'Image URL tidak valid atau tidak accessible. ' +
        'Pastikan: 1) HTTPS, 2) Public accessible (OSS ACL Public Read), 3) URL tidak ada spasi'
      );
    }
    
    throw new Error(`Video task creation failed: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('📡 Video task created:', data.output?.task_id);

  if (!data.output?.task_id) {
    throw new Error('No task_id returned from video API');
  }

  return await pollVideoTask(data.output.task_id);
}

async function pollVideoTask(taskId: string): Promise<string> {
  const maxAttempts = parseInt(process.env.MAX_POLLING_ATTEMPTS || '60');
  const pollInterval = parseInt(process.env.POLLING_INTERVAL_MS || '15000');
  const apiKey = process.env.DASHSCOPE_API_KEY!;
  const baseUrl = process.env.DASHSCOPE_BASE_URL!;

  console.log('⏳ Starting video polling, task_id:', taskId);

  for (let i = 0; i < maxAttempts; i++) {
    console.log(`🔄 Polling attempt ${i + 1}/${maxAttempts}...`);
    await new Promise(resolve => setTimeout(resolve, pollInterval));
    
    const response = await fetch(`${baseUrl}/tasks/${taskId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });

    const data = await response.json();
    const status = data.output?.task_status;

    console.log(`📊 Video task status: ${status}`);

    if (status === 'SUCCEEDED') {
      const videoUrl = data.output.video_url || '';
      console.log('✅ Video generation succeeded:', videoUrl);
      return videoUrl;
    }

    if (status === 'FAILED') {
      throw new Error(`Video generation failed: ${data.output?.message}`);
    }
  }

  throw new Error('Video generation timeout (15 minutes exceeded)');
}