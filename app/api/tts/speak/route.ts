import { NextRequest, NextResponse } from 'next/server';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const client = new ElevenLabsClient({
  apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || '',
});

// Essential voice options for interviews
export const VOICE_OPTIONS = [
  {
    id: 'pNInz6obpgDQGcFmaJgB',
    name: 'Adam',
    tone: 'Professional & Clear',
    description: 'Perfect for formal interviews'
  },
  {
    id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel',
    tone: 'Friendly & Approachable',
    description: 'Great for casual conversations'
  },
  {
    id: 'AZnzlk1XvdvUeBnXmlld',
    name: 'Domi',
    tone: 'Enthusiastic & Motivating',
    description: 'Encourages and motivates'
  }
];

// Simple voice settings for better quality
const DEFAULT_VOICE_SETTINGS = {
  stability: 0.7,
  similarityBoost: 0.8,
  style: 0.2,
  useSpeakerBoost: true
};

export async function GET() {
  try {
    return NextResponse.json({ 
      voices: VOICE_OPTIONS,
      defaultSettings: DEFAULT_VOICE_SETTINGS
    });
  } catch (error) {
    console.error('Error fetching voices:', error);
    return NextResponse.json({ 
      voices: VOICE_OPTIONS,
      defaultSettings: DEFAULT_VOICE_SETTINGS,
      error: 'Failed to fetch voices from ElevenLabs'
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text, voiceId, voiceSettings } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Use provided settings or defaults
    const settings = voiceSettings || DEFAULT_VOICE_SETTINGS;

    // Generate speech with optimized settings
    const audio = await client.textToSpeech.convert(voiceId || 'pNInz6obpgDQGcFmaJgB', {
      text: text,
      voiceSettings: settings,
      modelId: 'eleven_monolingual_v1'
    });

    return new NextResponse(audio, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error generating speech:', error);
    return NextResponse.json({ error: 'Failed to generate speech' }, { status: 500 });
  }
}
