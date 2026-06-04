
import React from 'react';

export type EmotionLabel = 'Happy' | 'Sad' | 'Angry' | 'Surprised' | 'Fear' | 'Disgust' | 'Neutral';

export interface EmotionScore {
  label: EmotionLabel;
  confidence: number;
}

export interface FaceAnalysisResult {
  emotions: EmotionScore[];
  dominantEmotion: EmotionLabel;
  timestamp: string;
}

export interface SpeechAnalysisResult {
  sentiment: string;
  magnitude: number;
  emotions: Record<string, number>;
  transcript: string;
}

export interface TextAnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  key_phrases: string[];
  entities: string[];
}

export interface RiskProfile {
  risk_level: 'Low' | 'Moderate' | 'High';
  indicators: string[];
  recommendations: string[];
  trend: 'Improving' | 'Stable' | 'Declining';
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}
