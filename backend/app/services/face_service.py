import numpy as np
import cv2
from PIL import Image
import torch
from transformers import AutoImageProcessor, AutoModelForImageClassification
from loguru import logger


class FaceEmotionService:

    def __init__(self):
        logger.info("Loading ViT face emotion model...")

        self.processor = AutoImageProcessor.from_pretrained(
            "trpakov/vit-face-expression"
        )

        self.model = AutoModelForImageClassification.from_pretrained(
            "trpakov/vit-face-expression"
        )

        self.model.eval()

        # Face detector
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        )

        # EMA smoothing
        self.smoothed = None
        self.alpha = 0.65

        # Emotion locking
        self.last_emotion = None
        self.switch_threshold = 0.12

        logger.info("ViT face emotion model loaded successfully.")

    # -------------------------------------------------------
    # MAIN ANALYZE FUNCTION
    # -------------------------------------------------------
    def analyze(self, image_bytes: bytes):

        # Decode image
        np_arr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if img is None:
            raise ValueError("Invalid image received")

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Detect faces
        faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.3,
            minNeighbors=5,
            minSize=(30, 30)
        )

        if len(faces) == 0:
            raise ValueError("No face detected")

        # Use largest detected face
        largest_face = max(faces, key=lambda rect: rect[2] * rect[3])
        x, y, w, h = largest_face

        face_img = img[y:y+h, x:x+w]

        # Convert to RGB
        face_img = cv2.cvtColor(face_img, cv2.COLOR_BGR2RGB)
        pil_image = Image.fromarray(face_img)

        # Model input
        inputs = self.processor(images=pil_image, return_tensors="pt")

        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits
            probs = torch.nn.functional.softmax(logits, dim=1)[0]

        emotions = {
            self.model.config.id2label[i]: float(probs[i])
            for i in range(len(probs))
        }

        # ---------------------------------------------------
        # EMA SMOOTHING
        # ---------------------------------------------------
        if self.smoothed is None:
            self.smoothed = emotions.copy()
        else:
            for key in emotions:
                self.smoothed[key] = (
                    self.alpha * emotions[key]
                    + (1 - self.alpha) * self.smoothed[key]
                )

        calibrated = self.smoothed.copy()

        # ---------------------------------------------------
        # CALIBRATION TWEAKS
        # ---------------------------------------------------
        if "angry" in calibrated:
            calibrated["angry"] *= 0.85

        if "sad" in calibrated:
            calibrated["sad"] *= 1.15

        # Normalize
        total = sum(calibrated.values())
        if total > 0:
            for k in calibrated:
                calibrated[k] /= total

        # ---------------------------------------------------
        # SORT EMOTIONS
        # ---------------------------------------------------
        sorted_emotions = sorted(
            calibrated.items(),
            key=lambda x: x[1],
            reverse=True
        )

        top_emotion, top_value = sorted_emotions[0]
        second_emotion, second_value = sorted_emotions[1]

        # ---------------------------------------------------
        # NEUTRAL SUPPRESSION
        # ---------------------------------------------------
        if top_emotion == "neutral" and (top_value - second_value) < 0.1:
            proposed_emotion = second_emotion
            proposed_confidence = second_value
        else:
            proposed_emotion = top_emotion
            proposed_confidence = top_value

        # ---------------------------------------------------
        # HYSTERESIS (Emotion Locking)
        # ---------------------------------------------------
        if self.last_emotion is None:
            final_emotion = proposed_emotion
            final_confidence = proposed_confidence
        else:
            current_last_conf = calibrated.get(self.last_emotion, 0)

            if proposed_emotion != self.last_emotion:
                if proposed_confidence - current_last_conf > self.switch_threshold:
                    final_emotion = proposed_emotion
                    final_confidence = proposed_confidence
                else:
                    final_emotion = self.last_emotion
                    final_confidence = current_last_conf
            else:
                final_emotion = proposed_emotion
                final_confidence = proposed_confidence

        self.last_emotion = final_emotion

        return {
            "dominant_emotion": final_emotion,
            "confidence": float(final_confidence),
            "all_emotions": calibrated
        }
