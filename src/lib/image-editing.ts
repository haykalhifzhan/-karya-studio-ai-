// src/lib/image-editing.ts
export interface ImageEditOptions {
  imageUrl: string;
  prompt: string;
  size?: string;
  quality?: 'low' | 'medium' | 'high';
  format?: 'png' | 'jpg';
}

export interface ImageEditResult {
  success: boolean;
  editedImageUrl?: string;
  error?: string;
  model?: string;
  size?: string;
}

// 🔥 DAFTAR MODEL YANG AKAN DICOBAA (dari yang paling recommended)
const MODELS_TO_TRY = [
  'qwen-image-edit-plus-2025-12-15',  // ✅ Paling stabil
  'qwen-image-edit-plus-2025-10-30',  // ✅ Alternatif
  'qwen-image-edit-max-2026-01-16',   // ✅ Max series
  'qwen-image-edit-max',              // ✅ Max (alias)
  'qwen-image-edit',                  // ✅ Basic
];

export async function editImageWithAI(options: ImageEditOptions): Promise<ImageEditResult> {
  const imageUrl = (options.imageUrl || '').toString().trim().replace(/\s+/g, '');
  const prompt = (options.prompt || '').toString().trim();
  const size = (options.size || '1024x1024').toString().trim();
  const format = 'png';

  if (!imageUrl || !prompt) {
    return { success: false, error: 'Image URL and prompt are required' };
  }

  const [widthStr, heightStr] = size.split('x');
  const width = parseInt(widthStr, 10);
  const height = parseInt(heightStr, 10);

  const apiKey = process.env.DASHSCOPE_API_KEY;
  const baseUrl = process.env.DASHSCOPE_BASE_URL;

  if (!apiKey || !baseUrl) {
    return { success: false, error: 'DashScope credentials not configured' };
  }

  console.log('🎨 Image Editing Request:', {
    imageUrl: imageUrl.substring(0, 100),
    prompt: prompt.substring(0, 100),
    size: `${width}x${height}`,
  });

  // 🔥 COBA SEMUA MODEL SATU PER SATU
  for (const model of MODELS_TO_TRY) {
    console.log(`🔄 Trying model: ${model}...`);

    try {
      // ✅ FIX: Endpoint TANPA /api/v1 (sama kayak Video Generator)
      const response = await fetch(`${baseUrl}/services/aigc/image-editing/generation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'X-DashScope-Async': 'enable',
        },
        body: JSON.stringify({
          model: model,
          input: {
            image: imageUrl,
            prompt: prompt,
          },
          parameters: {
            width,
            height,
            n: 1,
            output_format: format,
          },
        }),
      });

      console.log(`📡 [${model}] Response Status:`, response.status);

      // ✅ JIKA 200 OK, PARSE RESPONSE
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ [${model}] Success!`, data);

        const editedImageUrl = 
          data.output?.results?.[0]?.url || 
          data.output?.image || 
          data.output?.images?.[0];

        if (!editedImageUrl) {
          continue; // Coba model berikutnya
        }

        return { 
          success: true, 
          editedImageUrl, 
          model,
          size: `${width}x${height}` 
        };
      }

      // ✅ JIKA 404, MODEL TIDAK TERSEDIA, LANJUT KE MODEL BERIKUTNYA
      if (response.status === 404) {
        const errorData = await response.json().catch(() => ({}));
        console.warn(`⚠️ [${model}] Not available:`, errorData);
        continue; // Coba model berikutnya
      }

      // ✅ ERROR LAINNYA
      const errorData = await response.json().catch(() => ({}));
      console.error(`❌ [${model}] Error:`, errorData);

      if (errorData.code === 'InvalidApiKey') {
        return { success: false, error: 'Invalid API key' };
      }
      if (errorData.code === 'InvalidImage') {
        return { success: false, error: 'Invalid or inaccessible image URL' };
      }

    } catch (error: any) {
      console.warn(`⚠️ [${model}] Exception:`, error.message);
      continue; // Coba model berikutnya
    }
  }

  // ❌ SEMUA MODEL GAGAL
  return { 
    success: false, 
    error: 'All image editing models failed. Check DashScope console to activate a model.' 
  };
}