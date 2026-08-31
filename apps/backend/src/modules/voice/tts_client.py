from src.integrations.ai_client import synthesize_speech


async def text_to_speech(text: str, language: str = "hi") -> str:
    return await synthesize_speech(text, language)
