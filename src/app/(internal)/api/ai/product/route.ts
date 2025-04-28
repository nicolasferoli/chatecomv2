import { NextResponse } from 'next/server';

export const maxDuration = 300

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log(body)
    const response = await fetch('https://flowiseai-railway-production-4a15.up.railway.app/api/v1/prediction/5a811560-c2f5-454d-96e5-8421e8c57065', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from FlowiseAI');
    }

    const data = await response.json();
    return NextResponse.json({ text: data.text });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
