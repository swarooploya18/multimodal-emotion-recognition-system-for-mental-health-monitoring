import asyncio
from transformers import pipeline

# Load once
generator = pipeline(
    "text-generation",
    model="TinyLlama/TinyLlama-1.1B-Chat-v1.0",
    device=-1
)


def build_prompt(emotion: str, context: str):
    return f"""<|system|>
You are a helpful mental health assistant.
Give short, practical and human advice.

<|user|>
I am feeling {emotion}.
Situation: {context}

Give:
1. Advice
2. Suggestion
3. Motivation

<|assistant|>
"""


def generate_sync(emotion: str, context: str):
    prompt = f"""<|system|>
You are a mental health assistant.

Give helpful, realistic advice based on emotion.

<|user|>
Emotion: {emotion}
Situation: {context}

Write 2-3 sentences giving advice, suggestion and motivation.

<|assistant|>
"""

    output = generator(
        prompt,
        max_new_tokens=60,
        temperature=0.5,   # 🔥 less randomness
        do_sample=True,
        pad_token_id=50256
    )

    text = output[0]["generated_text"]

    # 🔥 FIX: extract ONLY assistant response
    if "<|assistant|>" in text:
        response = text.split("<|assistant|>")[-1].strip()
    else:
        response = text.replace(prompt, "").strip()

    return response


# Async wrapper
async def generate_support(emotion: str, context: str):
    try:
        return await asyncio.to_thread(generate_sync, emotion, context)
    except:
        return fallback_support(emotion)   # only if crash


# Fallback (important)
def fallback_support(emotion: str):
    emotion = emotion.lower()

    if emotion in ["anger"]:
        return "Take a pause and breathe deeply. Step away for a moment and come back with a calmer mind."

    elif emotion in ["sad", "depressed"]:
        return "You seem low. Try talking to someone you trust and take small steps forward. You're not alone."

    elif emotion in ["fear", "anxious"]:
        return "Slow your breathing and focus on what you can control. Take things one step at a time."

    elif emotion in ["happy", "joy"]:
        return "That’s great to hear! Keep doing what brings you joy and share that positivity with others."

    elif emotion in ["neutral"]:
        return "You seem stable. This is a good time to stay consistent and focus on your goals."

    elif emotion in ["surprise"]:
        return "Take a moment to process things. Stay calm and respond thoughtfully."

    elif emotion in ["disgust"]:
        return "It’s okay to feel uncomfortable. Step back and give yourself some space to reset."

    else:
        return "Take care of yourself. Small steps and a calm mind can make a big difference."