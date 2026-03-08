import { NextResponse } from 'next/server';

const API_KEY = process.env.DASHSCOPE_API_KEY;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, style } = body;

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

    // ==============================
    // SYSTEM PROMPT - IMAGE EDITING CONTEXT
    // ==============================
    const systemPrompt = `
You are a professional AI prompt enhancer specializing in AI-powered image editing and enhancement.

Your task is to transform simple editing requests into detailed, production-ready instructions suitable for AI image editing models.

STRICT RULES:
- Output ONLY one flowing paragraph (150–250 words, maximum 300 words).
- Do NOT use bullet points, numbering, markdown, or section titles.
- Do NOT explain your reasoning.
- Do NOT mention these instructions.
- Focus on actionable editing instructions, not generation from scratch.
- Keep descriptions concise but specific enough for AI editors to follow.

ENHANCEMENT GUIDELINES FOR IMAGE EDITING:

1. Translate all text into professional image editing terminology.
2. Add realistic editing adjustments:
   - Lighting fixes (brighten shadows, soften highlights, add fill light)
   - Color corrections (adjust white balance, enhance saturation, fix color cast)
   - Background modifications (remove, replace, blur, or change background)
   - Quality improvements (sharpen details, reduce noise, enhance clarity)
3. Specify editing style and mood:
   - Professional studio finish, warm lifestyle vibe, minimalist clean look
   - Subtle vs dramatic adjustments
4. Define subject-focused enhancements:
   - Make the main subject pop (contrast, sharpness, selective focus)
   - Preserve natural textures while improving overall quality
5. Include background/environment direction:
   - Clean white backdrop, soft gradient, blurred bokeh, lifestyle setting
   - Ensure background complements the subject
6. Add subtle post-processing direction:
   - Natural color grading, professional contrast, refined sharpness
   - Avoid over-editing; maintain realistic appearance

The final paragraph must read like a professional image editing brief that an AI editor can execute precisely.

Now enhance the following image editing prompt:
`;

    // ==============================
    // API CALL - Same structure as Photo Generator
    // ==============================
    const response = await fetch(
      `${process.env.DASHSCOPE_BASE_URL}/services/aigc/text-generation/generation`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.QWEN_MODEL || 'qwen3-max',
          input: {
            messages: [
              {
                role: 'system',
                content: systemPrompt,
              },
              {
                role: 'user',
                content: `Original editing prompt: "${prompt}". Style context: ${style || 'enhance'}. Provide the enhanced image editing instructions.`,
              },
            ],
          },
          parameters: {
            max_tokens: 900,
            temperature: 0.6,
            top_p: 0.9,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Enhancement API error:', data);
      throw new Error(data.message || 'Failed to enhance prompt');
    }

    let enhancedText =
      data.output?.choices?.[0]?.message?.content?.trim();

    if (!enhancedText) {
      throw new Error('No enhanced prompt generated');
    }

    // ==============================
    // SAFETY CLEANING (REMOVE MARKDOWN IF ANY)
    // ==============================
    enhancedText = enhancedText
      .replace(/^\*\*.*?\*\*/gim, '')
      .replace(/^- /gm, '')
      .replace(/^\d+\.\s/gm, '')
      .replace(/Certainly.*?:/i, '')
      .trim();

    // ==============================
    // WORD LIMIT ENFORCEMENT (MAX 300)
    // ==============================
    const words = enhancedText.split(/\s+/);
    if (words.length > 300) {
      enhancedText = words.slice(0, 300).join(' ');
    }

    console.log('✅ [Image Editor] Original prompt:', prompt);
    console.log('✅ [Image Editor] Enhanced prompt:', enhancedText);

    return NextResponse.json({
      success: true,
      enhanced: enhancedText,
      original: prompt,
      context: 'image-editing',
    });

  } catch (error: any) {
    console.error('Enhance prompt error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to enhance prompt',
      },
      { status: 500 }
    );
  }
}