# Deepgram Integration Guide

## Overview
Multi-tier STT/TTS integration with Deepgram as primary, with fallbacks to Web Speech API / ElevenLabs / Browser TTS.

## STT (Speech-to-Text) Priority:
1. **Deepgram** (primary) - with `filler_words: true` for capturing "um", "uh", "like"
2. **Web Speech API** (fallback) - when Deepgram limit exceeded

## TTS (Text-to-Speech) Priority:
1. **Deepgram TTS** (primary) - Aura model with Luna voice
2. **ElevenLabs** (fallback) - existing voices
3. **Browser TTS** (final fallback) - Web Speech Synthesis

## API Routes Created:
- `/api/deepgram/stt` - Deepgram speech transcription
- `/api/deepgram/tts` - Deepgram text-to-speech

## Environment Variables Needed:
Add to `.env.local`:
```env
DEEPGRAM_API_KEY=your_deepgram_api_key_here
```

## How to Get Deepgram API Key:
1. Sign up at https://deepgram.com (free tier: 12k hours/month)
2. Get API key from dashboard
3. Add to `.env.local`

## Implementation Status:
✅ Deepgram SDK installed
✅ API routes created
⏳ VoiceInterview.tsx integration pending (see TODO comments in file)

## Next Steps for Full Integration:
1. Implement Deepgram STT in `startListening()` function
2. Add audio recording when using Deepgram
3. Send audio chunks to `/api/deepgram/stt`
4. Update TTS fallback chain in `speakText()` function
5. Test with real interviews

## Current Behavior:
- STT: Uses Web Speech API only (no Deepgram yet)
- TTS: Uses ElevenLabs with browser fallback

