import torch
import io
import numpy as np
from pydub import AudioSegment
from transformers import AutoFeatureExtractor, AutoModelForAudioClassification
import torch.nn.functional as F
from loguru import logger


class SpeechEmotionService:
    def __init__(self):
        logger.info("Loading Speech Emotion Model...")

        self.model_name = "superb/wav2vec2-base-superb-er"

        self.feature_extractor = AutoFeatureExtractor.from_pretrained(
            self.model_name
        )

        self.model = AutoModelForAudioClassification.from_pretrained(
            self.model_name
        )

        self.model.eval()
        logger.info("Speech emotion model loaded successfully.")

    def _convert_to_wav(self, audio_bytes: bytes):
        """
        Converts any input (webm/ogg/wav) to mono 16kHz WAV
        """
        audio = AudioSegment.from_file(io.BytesIO(audio_bytes))

        audio = audio.set_channels(1)
        audio = audio.set_frame_rate(16000)

        samples = np.array(audio.get_array_of_samples()).astype(np.float32)

        # Normalize to [-1, 1]
        samples /= np.iinfo(audio.array_type).max

        return samples

    def analyze(self, audio_bytes: bytes):
        try:
            audio = self._convert_to_wav(audio_bytes)

            # Ignore very short recordings (unstable predictions)
            if len(audio) < 16000 * 2:  # < 2 seconds
                return {
                    "dominant_emotion": "too_short",
                    "confidence": 0.0
                }

            inputs = self.feature_extractor(
                audio,
                sampling_rate=16000,
                return_tensors="pt",
                padding=True
            )

            with torch.no_grad():
                outputs = self.model(**inputs)
                probs = F.softmax(outputs.logits, dim=-1)[0]

            predicted_id = torch.argmax(probs).item()
            confidence = float(probs[predicted_id])
            emotion = self.model.config.id2label[predicted_id]

            # Confidence thresholding
            if confidence < 0.40:
                emotion = "uncertain"

            return {
                "dominant_emotion": emotion,
                "confidence": confidence
            }

        except Exception as e:
            logger.error(f"Speech analysis failed: {str(e)}")
            raise
