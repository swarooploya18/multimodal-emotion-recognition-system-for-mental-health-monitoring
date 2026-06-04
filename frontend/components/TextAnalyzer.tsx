import React, { useState } from "react";
import { FileText, Send } from "lucide-react";

const TextAnalyzer: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  const [text, setText] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeText = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/analyze-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: "user_1",
          text: text,
        }),
      });

      const data = await response.json();
      setResult(data);

    } catch (err) {
      setError("Failed to analyze text.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">

      <div className="bg-slate-900 p-8 rounded-3xl">
        <h3 className="text-white mb-4">Text Emotion Analysis</h3>

        <textarea
          className="w-full h-40 bg-slate-800 p-4 text-white"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button onClick={analyzeText} className="mt-4 bg-indigo-600 px-4 py-2 text-white">
          Analyze
        </button>
      </div>

      {result && (
        <div className="bg-slate-900 p-8 rounded-3xl">

          <p className="text-white text-xl">
            {result.analysis.dominant_emotion}
          </p>

          {result.support && (
            <p className="text-green-400 mt-4">{result.support}</p>
          )}

          {/* 🔥 BUTTON */}
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setActiveTab("assistant")}
              className="px-6 py-3 bg-green-600 text-white rounded-xl"
            >
              Talk to Assistant
            </button>
          </div>

        </div>
      )}

    </div>
  );
};

export default TextAnalyzer;