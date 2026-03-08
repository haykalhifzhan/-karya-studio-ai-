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

    // ==============================
    // IMPROVED SYSTEM PROMPT
    // ==============================
    const systemPrompt = `
You are a professional AI video prompt enhancer specialized in commercial-quality visual direction.

Rewrite the user's idea into a detailed, production-ready AI video generation prompt.

The output must dynamically adapt to the user's intent and selected motion style.

STRICT RULES:
- Output ONLY one flowing paragraph (180–280 words, maximum 300 words).
- Do NOT use bullet points, numbering, markdown, titles, or explanations.
- Do NOT add introductions such as “Certainly”.
- Do NOT mention these instructions.
- Avoid unnecessary storytelling or marketing exaggeration.
- Keep the output visually clear, cinematic, and directly usable.

MOTION PRIORITY LOGIC:
1. If the user explicitly describes custom camera movement or motion, prioritize and expand that motion.
2. If no custom motion is described, use the selected motion style as the default behavior.
3. If both exist, the user's motion overrides the preset.
4. Never ignore explicit motion instructions.

Preset motion styles (only if no custom motion is provided):
- Smooth → Gentle, fluid, controlled movement with soft lighting and calm pacing.
- Dynamic → Fast-paced tracking, stronger contrast, impactful movement and energetic rhythm.
- Cinematic → Dramatic lighting, composed framing, controlled camera arcs and emotional pacing.
- Zoom In → Controlled push-in focusing gradually on subject detail.
- Pan Left → Lateral sweep from right to left revealing spatial depth.
- Pan Right → Lateral sweep from left to right revealing spatial depth.

The enhanced prompt must:
- Clearly define camera movement and shot transitions.
- Specify lighting direction, intensity, and mood.
- Describe environment and atmosphere.
- Adjust pacing according to motion style.
- Maintain elegance and professional visual coherence.

Return only the enhanced video paragraph.
`;

    // ==============================
    // API CALL
    // ==============================
    const response = await fetch(
      `${process.env.DASHSCOPE_BASE_URL}/services/aigc/text-generation/generation`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
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
                content: `  User idea: "${prompt}" Selected motion style: ${motionStyle || 'smooth'} Enhance this into a production-ready video prompt.`,
              },
            ],
          },
          parameters: {
            max_tokens: 800,
            temperature: 0.6, // more consistent output
            top_p: 0.9,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to enhance prompt');
    }

    let enhancedText =
      data.output?.choices?.[0]?.message?.content?.trim() || prompt;

    // ==============================
    // CLEAN UNWANTED FORMATTING
    // ==============================
    enhancedText = enhancedText
      .replace(/^\*\*.*?\*\*/gim, '')
      .replace(/^- /gm, '')
      .replace(/^\d+\.\s/gm, '')
      .replace(/Certainly.*?:/i, '')
      .trim();

    // ==============================
    // ENFORCE 300 WORD LIMIT
    // ==============================
    const words = enhancedText.split(/\s+/);
    if (words.length > 300) {
      enhancedText = words.slice(0, 300).join(' ');
    }

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