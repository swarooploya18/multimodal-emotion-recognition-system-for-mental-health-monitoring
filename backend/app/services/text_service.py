from transformers import pipeline
from loguru import logger


class TextEmotionService:
    def __init__(self):
        logger.info("Loading text emotion model...")
        self.classifier = pipeline(
            "text-classification",
            model="j-hartmann/emotion-english-distilroberta-base",
            top_k=None
        )
        logger.info("Text emotion model loaded successfully.")

    def analyze(self, text: str):
        try:
            raw = self.classifier(text)

            # ✅ Handle both list and nested list cases
            results = raw if isinstance(raw, list) and raw and not isinstance(raw[0], list) else (raw[0] if isinstance(raw, list) and raw and isinstance(raw[0], list) else raw)

            dominant = max(results, key=lambda x: x["score"])

            return {
                "input_text": text,
                "dominant_emotion": dominant.get("label", "unknown"),
                "confidence": float(dominant.get("score", 0.0)),
                "all_emotions": results
            }

        except Exception as e:
            logger.error(f"Text emotion analysis failed: {str(e)}")

            # ✅ RETURN SAFE RESPONSE instead of crashing
            return {
                "input_text": text,
                "dominant_emotion": "neutral",
                "confidence": 0.0,
                "all_emotions": []
            }