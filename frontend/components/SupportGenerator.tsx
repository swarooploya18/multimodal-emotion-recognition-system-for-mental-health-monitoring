export const generateSupport = (emotion: string) => {

  if (emotion === "sad") {
    return {
      summary: "You appear to be feeling sad or emotionally low.",
      advice: "Consider taking a short break and talking to someone you trust.",
      suggestion: "Listening to calming music, journaling, or going for a walk may help.",
      motivation: "Remember that tough times are temporary. You are stronger than you think."
    };
  }

  if (emotion === "angry") {
    return {
      summary: "You seem to be experiencing anger or frustration.",
      advice: "Take slow deep breaths and pause before reacting.",
      suggestion: "Physical activity or relaxation exercises can help release tension.",
      motivation: "You have the ability to calm your mind and regain control."
    };
  }

  if (emotion === "happy") {
    return {
      summary: "You appear to be in a positive emotional state.",
      advice: "Continue engaging in activities that bring you joy.",
      suggestion: "Share your positive energy with others.",
      motivation: "Your positivity can inspire the people around you."
    };
  }

  return {
    summary: "Your emotional state appears neutral.",
    advice: "Maintain a balanced routine and take care of your wellbeing.",
    suggestion: "Practice mindfulness and take regular breaks.",
    motivation: "Every day is a new opportunity to grow and improve."
  };
};