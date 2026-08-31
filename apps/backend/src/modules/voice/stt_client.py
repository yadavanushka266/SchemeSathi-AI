from src.integrations.ai_client import transcribe_audio


async def speech_to_text(audio_url: str, language: str = "hi") -> dict:
    return await transcribe_audio(audio_url, language)
