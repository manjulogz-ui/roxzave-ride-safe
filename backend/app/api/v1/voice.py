from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(prefix="/voice", tags=["Voice Copilot"])

LANGUAGES = ["en", "ta", "hi", "te", "kn"]

COMMANDS = {
    "start trip": {"action": "start_trip", "path": "/trips"},
    "navigate home": {"action": "navigate", "path": "/"},
    "call sos": {"action": "sos", "path": "/sos"},
    "find hospital": {"action": "emergency", "path": "/features/emergency-network"},
    "report pothole": {"action": "pothole", "path": "/features/pothole-detection"},
    "show safe route": {"action": "safe_route", "path": "/features/safe-route"},
}


class VoiceCommandRequest(BaseModel):
    text: str
    language: str = Field(default="en", pattern="^(en|ta|hi|te|kn)$")


@router.get("/languages")
async def list_languages():
    return [{"code": c, "name": {"en": "English", "ta": "Tamil", "hi": "Hindi", "te": "Telugu", "kn": "Kannada"}[c]} for c in LANGUAGES]


@router.post("/command")
async def parse_voice_command(data: VoiceCommandRequest):
    normalized = data.text.strip().lower()
    for phrase, meta in COMMANDS.items():
        if phrase in normalized:
            return {
                "recognized": True,
                "phrase": phrase,
                "action": meta["action"],
                "navigate_to": meta["path"],
                "language": data.language,
                "response": f"Opening {meta['action'].replace('_', ' ')}.",
            }
    return {
        "recognized": False,
        "language": data.language,
        "response": "Command not recognized. Try: Start trip, Call SOS, Find hospital, Show safe route.",
        "available_commands": list(COMMANDS.keys()),
    }


@router.get("/prompts")
async def voice_prompts(language: str = "en"):
    prompts = {
        "en": ["Start trip", "Navigate home", "Call SOS", "Find hospital", "Report pothole", "Show safe route"],
        "ta": ["பயணம் தொடங்கு", "SOS அழை", "மருத்துவமனை கண்டுபிடி"],
        "hi": ["यात्रा शुरू करें", "SOS कॉल करें", "अस्पताल खोजें"],
        "te": ["ప్రయాణం ప్రారంభించు", "SOS కాల్"],
        "kn": ["ಪ್ರಯಾಣ ಪ್ರಾರಂಭಿಸಿ", "SOS ಕರೆ"],
    }
    return {"language": language, "prompts": prompts.get(language, prompts["en"])}
