# Hero Image Generation - DALL-E Prompt

## Image Specifications
- **Dimensions:** 1920x600px (full-width hero banner)
- **Style:** Photorealistic, professional, World Bank official aesthetic
- **Theme:** Global development, international cooperation
- **Usage:** Landing page hero section

## DALL-E Prompt

```
A photorealistic wide panoramic image (16:9 aspect ratio) depicting global development and international cooperation in the official World Bank style. The composition features:

FOREGROUND: A diverse group of professionals in business attire (African, Asian, European, Latin American backgrounds) reviewing development plans together with digital tablets and blueprints, symbolizing collaborative partnership.

MIDDLE GROUND: Modern sustainable infrastructure - solar panels on community buildings, wind turbines on rolling hills, clean water facilities, and new schools with children visible through windows.

BACKGROUND: A subtle globe hologram projection showing interconnected data points and development indicators across continents, with soft blue (#0071bc) and white light rays.

LIGHTING: Golden hour natural lighting from the left, creating warm professional ambiance while maintaining the corporate aesthetic.

COLOR PALETTE: Dominated by World Bank blue (#0071bc), with accents of green (sustainability), warm earth tones (community), and white (clarity). Professional, hopeful, forward-looking.

STYLE: Highly detailed photorealistic rendering with sharp focus on foreground professionals, softer focus on background. Clean, modern, inspiring. Similar to official UN/World Bank annual report photography.

MOOD: Optimistic, collaborative, professional, forward-thinking, inclusive, action-oriented.

NO TEXT, NO LOGOS in the image - pure visual storytelling.
```

## Alternative Shorter Prompt

```
Photorealistic wide banner image (1920x600px): Diverse international team of professionals collaborating on development projects, with modern sustainable infrastructure (solar panels, wind turbines, schools) in background. Globe hologram showing data connections. World Bank blue (#0071bc) color palette, golden hour lighting, professional photography style. Optimistic and inspiring mood. No text or logos.
```

## Where to Generate

1. **ChatGPT Plus** - Use DALL-E 3
   - Copy prompt above
   - Request 1920x600px ratio
   - Download high resolution

2. **Bing Image Creator** - Free DALL-E access
   - https://www.bing.com/images/create
   - Paste prompt
   - Generate

3. **OpenAI API** - If you have API access
   - Use DALL-E 3 model
   - Size: 1792x1024 (closest to 16:9)
   - HD quality

## Save Location

Once generated, save the image as:
```
public/hero-global-development.jpg
```

## Usage in Code

The landing page will automatically use this image from `/hero-global-development.jpg`

---

**Status:** 📝 Prompt ready - Generate image and save to `public/` folder

