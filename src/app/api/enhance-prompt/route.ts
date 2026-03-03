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

    // ✅ IMPROVED: System prompt yang lebih detail untuk enhancement
    const systemPrompt = `You are an expert AI prompt enhancer for product photography. Your task is to transform basic product descriptions into highly detailed, professional photography prompts.

ENHANCEMENT GUIDELINES:
1. **Translate & Standardize**: Convert all text to professional English photography terminology
2. **Add Technical Details**:
   - Camera settings (aperture, shutter speed, ISO)
   - Lens type (macro, telephoto, wide-angle)
   - Focal length (e.g., 85mm, 50mm)
   
3. **Lighting Specifications**:
   - Type: softbox, ring light, natural window light, studio strobes
   - Direction: front-lit, side-lit, backlit, three-point lighting
   - Quality: soft diffused, hard dramatic, rim lighting
   - Temperature: warm (3200K), neutral (5500K), cool (6500K)
   
4. **Composition & Framing**:
   - Angle: eye-level, overhead/flat lay, 45-degree, low angle
   - Shot type: close-up, medium shot, wide shot, macro detail
   - Rule of thirds, centered, symmetrical, leading lines
   
5. **Background & Environment**:
   - Studio backdrop (seamless white, colored cyclorama)
   - Lifestyle setting (kitchen counter, wooden table, marble surface)
   - Depth of field (shallow bokeh, sharp throughout)
   
6. **Styling & Props**:
   - Minimalist, luxurious, rustic, modern
   - Complementary props (utensils, ingredients, textiles)
   - Color palette and mood
   
7. **Post-Processing**:
   - Color grading (warm tones, cool tones, neutral)
   - Retouching level (natural, high-end commercial)
   - Contrast and saturation adjustments

8. **Product-Specific Details**:
   - Highlight texture, color, shape
   - Emphasize quality and appeal
   - Maintain authenticity while elevating presentation

OUTPUT FORMAT:
Write ONE comprehensive, flowing paragraph (150-250 words) that seamlessly integrates all these elements. Do NOT use bullet points or lists. Make it read like a professional photography brief.

EXAMPLE TRANSFORMATION:
Input: "perbagus foto product nasi kebuli ini agar seperti gambar product professional"

Output: "Professional product photography of nasi kebuli (Indonesian spiced rice dish) captured in an elegant studio environment. The dish is artfully presented on a premium handcrafted ceramic plate with subtle earth tones that complement the rich golden-brown hues of the spiced rice. Soft, diffused lighting from a large softbox positioned at 45 degrees creates gentle shadows that accentuate the individual rice grains and textured surface while maintaining authentic detail. Shot with a medium format camera using an 85mm f/2.8 macro lens at f/5.6 to achieve optimal sharpness throughout the composition with just enough depth of field to keep the entire dish in focus. The camera is positioned at a slight 30-degree angle to showcase the height and dimension of the rice mound. Warm color temperature (3200K) enhances the appetizing appearance and brings out the aromatic spices. Background features a seamless cream-colored backdrop with subtle vignetting to draw attention to the subject. Minimalist styling with a few strategically placed fresh herbs and a traditional copper spoon as complementary props. Post-processing includes subtle color grading to emphasize warm amber and golden tones, moderate contrast enhancement, and careful retouching to maintain natural texture while achieving high-end commercial quality. The overall aesthetic is luxurious yet approachable, evoking sophistication and culinary excellence."

Now enhance the following prompt following these guidelines:`;

    // Call Qwen3-Max dengan prompt yang lebih baik
    const response = await fetch(`${process.env.DASHSCOPE_BASE_URL}/services/aigc/text-generation/generation`, {
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
              content: systemPrompt
            },
            {
              role: 'user',
              content: `Original prompt to enhance: "${prompt}"\n\nStyle context: ${style || 'studio'}\n\nEnhanced version:`
            }
          ]
        },
        parameters: {
          max_tokens: 1000,
          temperature: 0.8,  // Slightly higher for creativity
          top_p: 0.9,
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Enhancement API error:', data);
      throw new Error(data.message || 'Failed to enhance prompt');
    }

    const enhancedText = data.output?.choices?.[0]?.message?.content?.trim();

    if (!enhancedText) {
      throw new Error('No enhanced prompt generated');
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
        hint: 'The AI will still try to enhance your prompt'
      },
      { status: 500 }
    );
  }
}