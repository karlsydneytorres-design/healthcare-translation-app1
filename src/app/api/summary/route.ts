import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  const { text } = await request.json();

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Summarize the following healthcare conversation. Highlight medically important points such as symptoms, diagnoses, medications, and follow-up actions. Keep it concise.' },
        { role: 'user', content: text },
      ],
    });

    const summary = response.choices[0].message.content?.trim() || 'No summary available.';
    return NextResponse.json({ summary });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ summary: 'Error generating summary.' }, { status: 500 });
  }
}