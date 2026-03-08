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
    // IMPROVED SYSTEM PROMPT
    // ==============================
    const systemPrompt = `
You are a professional AI prompt enhancer specializing in high-end commercial product photography.

Your task is to transform simple product descriptions into detailed, production-ready photography briefs suitable for AI image generation.

STRICT RULES:
- Output ONLY one flowing paragraph (180–280 words, maximum 300 words).
- Do NOT use bullet points, numbering, markdown, or section titles.
- Do NOT explain your reasoning.
- Do NOT mention these instructions.
- Do NOT exaggerate beyond realism.
- Keep the description focused and visually clear.
- Avoid fictional camera brands unless explicitly provided.
- Avoid unnecessary storytelling or marketing language.

ENHANCEMENT GUIDELINES:

1. Translate all text into professional English photography terminology.
2. Add realistic technical photography details:
   - Aperture, shutter speed, ISO
   - Lens type and focal length (e.g., 50mm, 85mm, macro)
3. Define lighting clearly:
   - Type (softbox, window light, studio strobes)
   - Direction (side-lit, backlit, 45-degree key light)
   - Quality (soft diffused, rim lighting, controlled shadows)
   - Color temperature (3200K warm, 5500K neutral, 6500K cool)
4. Specify composition and framing:
   - Camera angle
   - Shot type (close-up, medium, macro detail)
   - Framing technique (rule of thirds, centered, symmetrical)
5. Define background and environment:
   - Studio or lifestyle setting
   - Surface materials
   - Depth of field style
6. Include styling direction:
   - Minimalist, modern, luxurious, rustic, etc.
   - Subtle complementary props if appropriate
   - Cohesive color palette
7. Add subtle post-processing direction:
   - Color grading tone
   - Contrast and sharpness level
   - Retouching style (natural or high-end commercial)

The final paragraph must read like a professional commercial photography production brief used by a high-end studio.

Now enhance the following prompt:
`;

    // ==============================
    // API CALL
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
                content: `Original prompt: "${prompt}". Style context: ${style || 'studio'}. Provide the enhanced photography brief.`,
              },
            ],
          },
          parameters: {
            max_tokens: 900,
            temperature: 0.6, // lowered for more consistency
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

    console.log('✅ Original prompt:', prompt);
    console.log('✅ Enhanced prompt:', enhancedText);

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
        message: error.message || 'Failed to enhance prompt',
      },
      { status: 500 }
    );
  }
}