import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@deepgram/sdk';

const deepgram = createClient(process.env.DEEPGRAM_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { text, voiceId } = await request.json();

    if (!text) {
      return NextResponse.json({ 
        success: false, 
        error: 'No text provided' 
      }, { status: 400 });
    }

    // Use Deepgram TTS with a professional voice
    const response = await deepgram.speak.request(
      {
        model: 'aura',
                               voice: 'luna', // Professional female voice
                        encoding: 'linear16',
                        container: 'wav',
        text,
      }
    );

    // Get the audio stream
    const audioStream = await response.getStream();
    const audioBuffer = await new Response(audioStream).arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/wav',
      },
    });

  } catch (error: any) {
    console.error('❌ Deepgram TTS error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'TTS failed',
      fallback: 'elevenlabs'
    }, { status: 500 });
  }
}

