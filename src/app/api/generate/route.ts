import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Type for Gemini response with images
interface GeminiMessageWithImages {
  content: string | null;
  images?: Array<{ image_url: string | { url: string } }>;
}

// OpenRouter client for Gemini (Image to Image)
function createOpenRouterClient() {
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
      "HTTP-Referer": "https://nanobanana.ai",
      "X-Title": "Nano Banana AI",
    },
  });
}

// OpenAI client for DALL-E (Text to Image)
function createOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function POST(request: NextRequest) {
  try {
    // Check for required environment variables
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'OPENROUTER_API_KEY is not configured' }, { status: 500 });
    }

    const openrouter = createOpenRouterClient();
    const formData = await request.formData();
    const image = formData.get('image') as File | null;
    const prompt = formData.get('prompt') as string;
    const mode = formData.get('mode') as string || 'image-to-image';

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // For image-to-image mode, image is required
    if (mode === 'image-to-image' && !image) {
      return NextResponse.json({ error: 'Image is required for Image to Image mode' }, { status: 400 });
    }

    let dataUrl = null;
    let generatedImage = null;
    let resultText = '';

    // Process image if provided (for image-to-image mode)
    if (image) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Image = buffer.toString('base64');
      const mimeType = image.type;
      dataUrl = `data:${mimeType};base64,${base64Image}`;
    }

    // Build content based on mode
    const content: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> = [
      {
        "type": "text",
        "text": mode === 'text-to-image'
          ? `Create a detailed image based on this prompt: "${prompt}". Generate a high-quality, detailed image that matches the description exactly. Please create and return the actual image.`
          : `Generate a new image based on this prompt: "${prompt}". Please create and return the actual image, not just a description.`
      }
    ];

    // Add image to content only for image-to-image mode
    if (dataUrl && mode === 'image-to-image') {
      content.push({
        "type": "image_url",
        "image_url": {
          "url": dataUrl
        }
      });
    }

    try {
      console.log(`Using Gemini for ${mode} generation`);

      const completion = await openrouter.chat.completions.create({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            "role": "user",
            "content": content
          }
        ],
      });

      console.log('Full Gemini API Response:', JSON.stringify(completion, null, 2));

      const message = completion.choices[0].message;
      const response = message.content;

      // Extract image from Gemini response
      const messageWithImages = message as GeminiMessageWithImages;
      if (messageWithImages.images && Array.isArray(messageWithImages.images) && messageWithImages.images.length > 0) {
        const imageData = messageWithImages.images[0].image_url;
        generatedImage = typeof imageData === 'string' ? imageData : imageData.url;
        console.log('Found image in Gemini response:', generatedImage);
      }

      resultText = typeof response === 'string' ? response : '';
    } catch (error) {
      console.error('Gemini API Error:', error);
      return NextResponse.json({
        error: 'Failed to process with Gemini',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

    console.log('Final generatedImage:', generatedImage);
    console.log('Final resultText:', resultText);

    return NextResponse.json({
      success: true,
      result: resultText,
      originalImage: dataUrl,
      generatedImage: generatedImage,
      prompt: prompt,
      mode: mode,
      hasGeneratedImage: !!generatedImage,
      apiUsed: 'Gemini'
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}