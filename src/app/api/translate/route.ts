import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  const { text, toLang } = await request.json();

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: `Translate the following text to ${toLang}. Only return the translated text.` },
        { role: 'user', content: text },
      ],
    });

    const translatedText = response.choices[0].message.content?.trim() || text;
    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ translatedText: text }, { status: 500 });
  }
}