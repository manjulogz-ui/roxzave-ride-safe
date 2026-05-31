from fastapi import APIRouter

router = APIRouter(prefix="/ai", tags=["AI Modules"])


@router.get("/{module}/recommendations")
async def get_recommendations(module: str):
    return {
        "module": module,
        "items": [
            f"Analyze your latest trips for {module.replace('-', ' ')} insights.",
            "Connect ESP32 device for real-time sensor data.",
            "Enable guardian sharing for emergency scenarios.",
        ],
    }
