import type { Template, Achievement, DailyTip, OnboardingStep } from '@/types';

// ========================
// Templates Data
// ========================

export const templates: Template[] = [
  // Food & Beverage
  { id: 't-food-1', name: 'Appetizing Dish', category: 'food', description: 'Crispy & appetizing food photography for Instagram', prompt: 'Professional food photography of [PRODUCT NAME], crispy spaceen texture, soft studio lighting, white ceramic plate, garnished with fresh herbs, steam rising, shallow depth of field, top-down angle, clean minimal background', previewUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop', tags: ['food', 'instagram', 'appetizing'], usageCount: 245 },
  { id: 't-food-2', name: 'Fresh Beverage', category: 'food', description: 'Refreshing drink with condensation detail', prompt: 'Product photo of [PRODUCT NAME] in a glass, condensation droplets on surface, ice cubes visible, slice of citrus garnish, soft backlight creating glow, neutral studio background, commercial quality', previewUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=400&fit=crop', tags: ['beverage', 'fresh', 'commercial'], usageCount: 189 },
  { id: 't-food-3', name: 'Bakery Showcase', category: 'food', description: 'Warm bakery products with artisan feel', prompt: 'Artisan bakery photo of [PRODUCT NAME], spaceen brown crust, rustic wooden cutting board, scattered flour, warm tungsten lighting, cozy atmosphere, shallow depth of field', previewUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop', tags: ['bakery', 'artisan', 'warm'], usageCount: 156 },
  { id: 't-food-4', name: 'Street Food Style', category: 'food', description: 'Vibrant street food photography', prompt: 'Vibrant street food photography of [PRODUCT NAME], colorful spices and ingredients, handheld presentation, bokeh background with market lights, natural outdoor lighting, appetizing and authentic look', previewUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop', tags: ['street-food', 'vibrant', 'authentic'], usageCount: 134 },
  { id: 't-food-5', name: 'Coffee & Cafe', category: 'food', description: 'Cozy coffee shop aesthetic', prompt: 'Coffee shop photography of [PRODUCT NAME], latte art visible, ceramic cup on wooden table, morning sunlight through window, newspaper and pastry nearby, warm tones, Instagram aesthetic', previewUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop', tags: ['coffee', 'cafe', 'aesthetic'], usageCount: 210 },

  // Fashion
  { id: 't-fashion-1', name: 'Elegant Catalog', category: 'fashion', description: 'Clean catalog product photo for online store', prompt: 'Product photo of [PRODUCT NAME] for online catalog, clean white background, professional studio lighting, fabric texture detail visible, multiple angles, e-commerce ready, high resolution', previewUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop', tags: ['catalog', 'e-commerce', 'clean'], usageCount: 312 },
  { id: 't-fashion-2', name: 'Lifestyle Fashion', category: 'fashion', description: 'Fashion in lifestyle context', prompt: 'Lifestyle fashion photography of [PRODUCT NAME], model in urban setting, spaceen hour natural lighting, street style, candid pose, blurred city background, editorial look', previewUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=400&fit=crop', tags: ['lifestyle', 'urban', 'editorial'], usageCount: 267 },
  { id: 't-fashion-3', name: 'Flat Lay Fashion', category: 'fashion', description: 'Organized flat lay clothing arrangement', prompt: 'Flat lay product photography of [PRODUCT NAME], neatly arranged on marble surface, complementary accessories, overhead shot, soft natural lighting, minimalist styling, Instagram-ready', previewUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&h=400&fit=crop', tags: ['flat-lay', 'minimalist', 'instagram'], usageCount: 198 },
  { id: 't-fashion-4', name: 'Premium Accessories', category: 'fashion', description: 'Luxury accessories photography', prompt: 'Luxury product photography of [PRODUCT NAME], velvet display surface, dramatic side lighting, rich shadows, spaceen accent props, premium feel, close-up detail shots, high-end commercial look', previewUrl: 'https://images.unsplash.com/photo-1611923134239-b9be5816d0f0?w=400&h=400&fit=crop', tags: ['luxury', 'accessories', 'premium'], usageCount: 145 },
  { id: 't-fashion-5', name: 'Batik Collection', category: 'fashion', description: 'Indonesian batik fabric showcase', prompt: 'Product photography of [PRODUCT NAME] Indonesian batik, intricate pattern detail, draped on wooden mannequin, natural fiber texture visible, warm ambient lighting, cultural heritage feel', previewUrl: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=400&h=400&fit=crop', tags: ['batik', 'indonesian', 'traditional'], usageCount: 178 },

  // Handicrafts
  { id: 't-craft-1', name: 'Artisan Craft', category: 'handicrafts', description: 'Handmade craft with natural background', prompt: 'Product photo of [PRODUCT NAME] handmade craft, natural rattan and wood background, soft window lighting, artisan detail visible, woven texture, earthy color palette, bohemian aesthetic', previewUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop', tags: ['handmade', 'artisan', 'natural'], usageCount: 167 },
  { id: 't-craft-2', name: 'Pottery Display', category: 'handicrafts', description: 'Ceramic and pottery showcase', prompt: 'Ceramic pottery photography of [PRODUCT NAME], kiln-fired glaze detail, styled on linen cloth, dried flowers arrangement, warm studio lighting, handcrafted imperfections visible, artisan appeal', previewUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop', tags: ['pottery', 'ceramic', 'handcrafted'], usageCount: 134 },
  { id: 't-craft-3', name: 'Jewelry Macro', category: 'handicrafts', description: 'Detailed jewelry macro photography', prompt: 'Macro photography of [PRODUCT NAME] jewelry, intricate metalwork detail, gemstone reflection, black velvet background, focused ring light, commercial quality, extreme close-up detail', previewUrl: 'https://images.unsplash.com/photo-1515562141589-67f0d999c7f5?w=400&h=400&fit=crop', tags: ['jewelry', 'macro', 'detail'], usageCount: 201 },
  { id: 't-craft-4', name: 'Woven Textiles', category: 'handicrafts', description: 'Traditional woven textile showcase', prompt: 'Product photography of [PRODUCT NAME] woven textile, close-up weave pattern, natural dye colors, draped display, traditional loom in background, cultural craftsmanship, warm earth tones', previewUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop', tags: ['textile', 'woven', 'traditional'], usageCount: 112 },
  { id: 't-craft-5', name: 'Wood Carving', category: 'handicrafts', description: 'Hand-carved wooden art photography', prompt: 'Product photo of [PRODUCT NAME] wood carving, grain texture visible, dramatic side lighting creating shadows, craftsmanship detail, chisel marks artistic, dark wood background, museum quality display', previewUrl: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400&h=400&fit=crop', tags: ['woodwork', 'carving', 'artistic'], usageCount: 89 },

  // Electronics
  { id: 't-elec-1', name: 'Tech Product Launch', category: 'electronics', description: 'Sleek tech product on minimal background', prompt: 'Product photography of [PRODUCT NAME], sleek design on matte black surface, gradient blue-purple accent lighting, reflection visible, modern minimalist composition, tech advertisement quality', previewUrl: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&h=400&fit=crop', tags: ['tech', 'sleek', 'modern'], usageCount: 289 },
  { id: 't-elec-2', name: 'Gadget Lifestyle', category: 'electronics', description: 'Gadget in everyday use context', prompt: 'Lifestyle photography of [PRODUCT NAME], person using device in modern office, natural daylight, clean desk setup, shallow depth of field on product, contemporary workspace aesthetic', previewUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=400&fit=crop', tags: ['gadget', 'lifestyle', 'office'], usageCount: 234 },
  { id: 't-elec-3', name: 'Product Exploded View', category: 'electronics', description: 'Components and detail showcase', prompt: 'Product detail photography of [PRODUCT NAME], multiple angles shown, key features highlighted, clean white background, specification callouts space, e-commerce listing ready, sharp focus throughout', previewUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400&h=400&fit=crop', tags: ['detail', 'e-commerce', 'specs'], usageCount: 178 },
  { id: 't-elec-4', name: 'Gaming Setup', category: 'electronics', description: 'RGB gaming aesthetics', prompt: 'Gaming product photography of [PRODUCT NAME], RGB lighting effects, dark environment, neon color accents, gaming desk setup, dramatic low-key lighting, esports aesthetic', previewUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400&h=400&fit=crop', tags: ['gaming', 'rgb', 'neon'], usageCount: 156 },
  { id: 't-elec-5', name: 'Smart Home Device', category: 'electronics', description: 'Smart device in home setting', prompt: 'Smart home product photography of [PRODUCT NAME], placed in modern living room, natural home lighting, connected lifestyle, minimal Scandinavian interior, IoT device aesthetic, warm and inviting', previewUrl: 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=400&h=400&fit=crop', tags: ['smart-home', 'iot', 'modern'], usageCount: 123 },

  // Cosmetics
  { id: 't-cosm-1', name: 'Beauty Product', category: 'cosmetics', description: 'Clean beauty product photography', prompt: 'Beauty product photography of [PRODUCT NAME], clean white marble surface, soft diffused lighting, product reflection, elegant minimal styling, skincare aesthetic, pastel color accents', previewUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop', tags: ['beauty', 'skincare', 'elegant'], usageCount: 298 },
  { id: 't-cosm-2', name: 'Natural Cosmetics', category: 'cosmetics', description: 'Organic natural beauty products', prompt: 'Natural cosmetics photography of [PRODUCT NAME], surrounded by fresh botanicals, green leaves and flowers, wooden surface, morning dew drops, organic and eco-friendly feel, earth tones', previewUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop', tags: ['natural', 'organic', 'botanical'], usageCount: 234 },
  { id: 't-cosm-3', name: 'Makeup Flat Lay', category: 'cosmetics', description: 'Colorful makeup arrangement', prompt: 'Flat lay makeup photography of [PRODUCT NAME], colorful cosmetics arrangement, powder swatches visible, brushes as props, pink and space color scheme, beauty blogger aesthetic, overhead shot', previewUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=400&fit=crop', tags: ['makeup', 'flat-lay', 'colorful'], usageCount: 189 },
  { id: 't-cosm-4', name: 'Skincare Routine', category: 'cosmetics', description: 'Skincare steps and products', prompt: 'Skincare routine photography of [PRODUCT NAME], products arranged in order of use, water droplets texture, glass and chrome materials, soft blue lighting, clinical yet luxurious feel, dermatology approved look', previewUrl: 'https://images.unsplash.com/photo-1570194065650-d99fb4d8a609?w=400&h=400&fit=crop', tags: ['skincare', 'routine', 'clinical'], usageCount: 167 },
  { id: 't-cosm-5', name: 'Fragrance Bottle', category: 'cosmetics', description: 'Perfume with artistic lighting', prompt: 'Fragrance photography of [PRODUCT NAME], crystal bottle on reflective surface, colored gel lighting, smoke wisps, dramatic shadows, luxury perfume advertisement, artistic composition', previewUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop', tags: ['fragrance', 'luxury', 'artistic'], usageCount: 145 },
];

// ========================
// Achievements Data
// ========================

export const achievements: Achievement[] = [
  { id: 'first-step', name: 'First Step', description: 'Complete the onboarding tutorial', icon: 'Footprints', rarity: 'bronze', criteria: 'Complete onboarding', threshold: 1 },
  { id: 'creative-mind', name: 'Creative Mind', description: 'Generate your first product photo', icon: 'Camera', rarity: 'bronze', criteria: 'Generate 1 photo', threshold: 1 },
  { id: 'video-creator', name: 'Video Creator', description: 'Create your first promo video', icon: 'Video', rarity: 'bronze', criteria: 'Generate 1 video', threshold: 1 },
  { id: 'batch-pro', name: 'Batch Pro', description: 'Complete a batch generation session', icon: 'Layers', rarity: 'silver', criteria: 'Complete 1 batch', threshold: 1 },
  { id: 'consistent-user', name: 'Consistent User', description: 'Generate 10 total creations', icon: 'TrendingUp', rarity: 'silver', criteria: 'Generate 10 items', threshold: 10 },
  { id: 'template-master', name: 'Template Master', description: 'Use 5 different templates', icon: 'LayoutTemplate', rarity: 'silver', criteria: 'Use 5 templates', threshold: 5 },
  { id: 'prompt-expert', name: 'Prompt Expert', description: 'Use the prompt enhancer 10 times', icon: 'Sparkles', rarity: 'space', criteria: 'Enhance 10 prompts', threshold: 10 },
  { id: 'social-sharer', name: 'Social Sharer', description: 'Save 20 favorites for sharing', icon: 'Heart', rarity: 'space', criteria: 'Save 20 favorites', threshold: 20 },
  { id: 'msme-champion', name: 'MSME Champion', description: 'Generate 50 total creations', icon: 'Trophy', rarity: 'platinum', criteria: 'Generate 50 items', threshold: 50 },
];

// ========================
// Daily Tips
// ========================

export const dailyTips: DailyTip[] = [
  { id: 1, title: 'Lighting Matters', content: 'Use natural light near a window for warm, inviting product photos. Morning light between 8-10 AM creates a soft spaceen glow.', icon: 'Sun' },
  { id: 2, title: 'Consistent Branding', content: 'Use the same style & color palette across all your product photos. Consistency builds brand recognition and trust.', icon: 'Palette' },
  { id: 3, title: 'Show Context', content: 'Place products in lifestyle contexts. A cup of coffee on a desk tells a story better than on a white background alone.', icon: 'Frame' },
  { id: 4, title: 'Detailed Descriptions', content: 'The more specific your prompt, the better the result. Include material, color, size, and mood in your description.', icon: 'FileText' },
  { id: 5, title: 'Batch for Efficiency', content: 'Use batch mode to generate multiple product photos at once. Save time and maintain consistent styling across products.', icon: 'Zap' },
  { id: 6, title: 'Templates Save Time', content: 'Browse our template gallery and customize prompts rather than starting from scratch. Templates are optimized for results.', icon: 'LayoutTemplate' },
  { id: 7, title: 'Video Converts Better', content: 'Short promo videos get 3x more engagement on social media. Try creating 15-second clips from your product photos.', icon: 'PlayCircle' },
  { id: 8, title: 'Use the Enhancer', content: 'The AI prompt enhancer adds professional photography terms that dramatically improve generation quality.', icon: 'Sparkles' },
  { id: 9, title: 'Multiple Angles', content: 'Generate multiple variations with different styles. Customers want to see products from different perspectives.', icon: 'RotateCw' },
  { id: 10, title: 'Seasonal Content', content: 'Create festive product photos for holidays like Ramadan, Lebaran, or year-end sales to boost seasonal engagement.', icon: 'Calendar' },
];

// ========================
// Onboarding Steps
// ========================

export const onboardingSteps: OnboardingStep[] = [
  { id: 1, title: 'Welcome to KaryaStudio AI!', description: 'Your professional design studio for creating stunning product photos and videos. Let us show you around!', icon: 'Sparkles' },
  { id: 2, title: 'Your Dashboard', description: 'This is your command center. View stats, quick actions, and recent creations all in one place.', icon: 'LayoutDashboard' },
  { id: 3, title: 'Generate Product Photos', description: 'Describe your product or upload an image, choose a style, and let AI create professional photos instantly.', icon: 'Camera' },
  { id: 4, title: 'Create Promo Videos', description: 'Transform your product photos into cinematic promo videos with motion effects and transitions.', icon: 'Video' },
  { id: 5, title: 'Template Gallery', description: 'Browse ready-made prompt templates organized by category. One click to start creating!', icon: 'LayoutTemplate' },
  { id: 6, title: 'Earn Achievements', description: 'Complete challenges to unlock badges and track your creative journey. You just earned your first one!', icon: 'Trophy' },
];

// ========================
// Photo Styles
// ========================

export const photoStyles = [
  { id: 'studio' as const, name: 'Studio', description: 'Clean professional studio setup', icon: 'Aperture', color: 'bg-blue-500' },
  { id: 'natural' as const, name: 'Natural', description: 'Outdoor natural lighting', icon: 'Sun', color: 'bg-green-500' },
  { id: 'premium' as const, name: 'Premium', description: 'Luxury high-end aesthetic', icon: 'Crown', color: 'bg-purple-500' },
  { id: 'cheerful' as const, name: 'Cheerful', description: 'Bright colorful and fun', icon: 'Smile', color: 'bg-pink-500' },
];

// ========================
// Motion Styles
// ========================

export const motionStyles = [
  { id: 'zoom-in' as const, name: 'Zoom In', description: 'Dramatic zoom into the product', icon: 'ZoomIn' },
  { id: 'rotation-360' as const, name: '360\u00b0 Rotation', description: 'Full rotation around the product', icon: 'RotateCw' },
  { id: 'parallax' as const, name: 'Parallax', description: 'Layered depth parallax effect', icon: 'Layers' },
  { id: 'smoke' as const, name: 'Smoke Effect', description: 'Mysterious smoke and fog reveal', icon: 'CloudFog' },
  { id: 'smooth-transition' as const, name: 'Smooth Transition', description: 'Gentle fade and morph transitions', icon: 'Blend' },
  { id: 'cinematic-pan' as const, name: 'Cinematic Pan', description: 'Wide cinematic camera movement', icon: 'Film' },
];

// ========================
// Mock Image URLs
// ========================

export const mockGeneratedImages = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&h=600&fit=crop',
];

export const mockVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4';
