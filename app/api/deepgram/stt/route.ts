import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@deepgram/sdk';

const deepgram = createClient(process.env.DEEPGRAM_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json({ 
        success: false, 
        error: 'No audio file provided' 
      }, { status: 400 });
    }

    // Convert File to Buffer
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

    // Transcribe with filler words enabled
    const response = await deepgram.listen.rest.transcribeFile(
      audioBuffer,
      {
        model: 'nova-2',
        language: 'en-US',
        smart_format: true,
        filler_words: true, // Critical for capturing "um", "uh", "like", etc.
        paragraphs: false,
        punctuate: true,
        diarize: false,
      }
    );

    if (response.result?.results?.channels[0]?.alternatives[0]?.transcript) {
      const transcript = response.result.results.channels[0].alternatives[0].transcript;
      
      return NextResponse.json({
        success: true,
        transcript,
        model: 'deepgram-nova-2',
      });
    } else {
      throw new Error('No transcript returned from Deepgram');
    }

  } catch (error: any) {
    console.error('❌ Deepgram STT error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Transcription failed',
      fallback: 'web-speech'
    }, { status: 500 });
  }
}

