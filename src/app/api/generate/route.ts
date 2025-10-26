import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://nanobanana.ai",
    "X-Title": "Nano Banana AI",
  },
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const prompt = formData.get('prompt') as string;

    if (!image || !prompt) {
      return NextResponse.json({ error: 'Image and prompt are required' }, { status: 400 });
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');
    const mimeType = image.type;
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash-image-preview",
      messages: [
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `Generate a new image based on this prompt: "${prompt}". Please create and return the actual image, not just a description.`
            },
            {
              "type": "image_url",
              "image_url": {
                "url": dataUrl
              }
            }
          ]
        }
      ],
    });

    console.log('Full API Response:', JSON.stringify(completion, null, 2));

    const message = completion.choices[0].message;
    const response = message.content;

    // Extract image from response based on your screenshot format
    let generatedImage = null;
    let resultText = response;

    // Check if the message has images array (as shown in your screenshot)
    if (message.images && Array.isArray(message.images) && message.images.length > 0) {
      const imageData = message.images[0].image_url;
      // Handle both string URLs and objects with url property
      generatedImage = typeof imageData === 'string' ? imageData : imageData.url;
      console.log('Found image in message.images:', generatedImage);
    }

    // Also check the content if it's an object
    if (typeof response === 'object' && response !== null) {
      if (response.images && Array.isArray(response.images) && response.images.length > 0) {
        const imageData = response.images[0].image_url;
        generatedImage = typeof imageData === 'string' ? imageData : imageData.url;
        console.log('Found image in response.images:', generatedImage);
      }
      // Get text content if it exists
      if (response.content) {
        resultText = response.content;
      }
    }

    console.log('Final generatedImage:', generatedImage);
    console.log('Final resultText:', resultText);

    return NextResponse.json({
      success: true,
      result: resultText,
      originalImage: dataUrl,
      generatedImage: generatedImage,
      prompt: prompt,
      hasGeneratedImage: !!generatedImage
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      error: 'Failed to process image',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}