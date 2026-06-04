from fastapi import APIRouter
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
import re

router = APIRouter()

torch.set_num_threads(2)
torch.set_num_interop_threads(1)

MODEL_NAME = "microsoft/phi-2"


# ----------------------------
# DEVICE SETUP (AUTO GPU/CPU)
# ----------------------------

device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")


# ----------------------------
# LOAD MODEL ON STARTUP
# ----------------------------

print("Loading Phi-2 model...")

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    torch_dtype=torch.float16 if device == "cuda" else torch.float32,
    low_cpu_mem_usage=True
)

model.to(device)
model.eval()

print("Phi-2 loaded successfully.")


# ----------------------------
# Request Models
# ----------------------------

class AssistantRequest(BaseModel):
    message: str


class EmotionSupportRequest(BaseModel):
    emotion: str


# ----------------------------
# Utility Functions
# ----------------------------

def clean_text(text):
    text = re.sub(r"\s+", " ", text)
    sentences = re.split(r'(?<=[.!?]) +', text)
    return " ".join(sentences[:3]).strip()


def fallback():
    return (
        "I'm really sorry you're going through this. "
        "Take a small step today and be kind to yourself. "
        "You can improve from here."
    )


# ----------------------------
# Chat Assistant Endpoint
# ----------------------------

@router.post("/assistant")
def assistant(request: AssistantRequest):

    try:
        prompt = (
            "You are a supportive friend. "
            "Respond in 2-3 short natural sentences.\n\n"
            f"User: {request.message}\n"
            "Assistant:"
        )

        inputs = tokenizer(prompt, return_tensors="pt").to(device)

        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=100,
                temperature=0.6,
                top_p=0.9,
                repetition_penalty=1.1,
                do_sample=True,
                eos_token_id=tokenizer.eos_token_id
            )

        generated_tokens = outputs[0][inputs["input_ids"].shape[1]:]

        response = tokenizer.decode(
            generated_tokens,
            skip_special_tokens=True
        )

        response = clean_text(response)

        if len(response) < 10:
            return {"response": fallback()}

        return {"response": response}

    except Exception:
        return {"response": fallback()}


# ----------------------------
# Emotional Support Endpoint
# ----------------------------

@router.post("/support")
def emotional_support(data: EmotionSupportRequest):

    try:
        prompt = f"""
You are a compassionate mental health assistant helping a student.

The detected emotion of the student is: {data.emotion}

Provide emotional support in the following format:

Summary:
Advice:
Suggestions:
Motivation:

Keep the tone calm, supportive, and encouraging.

Assistant:
"""

        inputs = tokenizer(prompt, return_tensors="pt").to(device)

        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=150,
                temperature=0.7,
                top_p=0.9,
                repetition_penalty=1.1,
                do_sample=True,
                eos_token_id=tokenizer.eos_token_id
            )

        generated_tokens = outputs[0][inputs["input_ids"].shape[1]:]

        response = tokenizer.decode(
            generated_tokens,
            skip_special_tokens=True
        )

        response = re.sub(r"\s+", " ", response).strip()

        if len(response) < 20:
            return {"response": fallback()}

        return {"response": response}

    except Exception:
        return {"response": fallback()}