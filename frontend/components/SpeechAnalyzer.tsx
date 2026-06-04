import React, { useState, useRef } from "react";
import { Mic, Square, Play, BarChart3, Waves } from "lucide-react";

const API = "http://127.0.0.1:8000/api";

const SpeechAnalyzer: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Start Recording
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
      setAudioUrl(URL.createObjectURL(audioBlob));
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  // Analyze
  const analyzeAudio = async () => {
    if (!audioUrl) return;

    setProcessing(true);
    setResult(null);

    try {
      const blob = await fetch(audioUrl).then((r) => r.blob());

      const formData = new FormData();
      formData.append("student_id", "student_001");
      formData.append("file", blob, "audio.webm");

      const response = await fetch(`${API}/analyze-speech`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data);

    } catch (error) {
      console.error("Speech analysis failed:", error);
    }

    setProcessing(false);
  };

  return (
    <div className="space-y-8">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* RECORDING */}
        <div className="bg-slate-900 p-8 rounded-3xl flex flex-col items-center">

          <div className={`w-32 h-32 rounded-full flex items-center justify-center ${
            isRecording ? "bg-red-600" : "bg-indigo-600"
          }`}>
            {isRecording ? <Square className="text-white" /> : <Mic className="text-white" />}
          </div>

          <div className="mt-6">
            {!isRecording ? (
              <button onClick={startRecording} className="bg-indigo-600 px-6 py-3 text-white rounded-xl">
                Start Recording
              </button>
            ) : (
              <button onClick={stopRecording} className="bg-red-600 px-6 py-3 text-white rounded-xl">
                Stop
              </button>
            )}
          </div>

          {audioUrl && !isRecording && (
            <div className="mt-6 flex gap-4">
              <button onClick={() => new Audio(audioUrl).play()} className="bg-indigo-600 p-2 rounded">
                <Play />
              </button>

              <button onClick={analyzeAudio} className="bg-slate-700 px-4 py-2 text-white rounded">
                {processing ? "Processing..." : "Analyze"}
              </button>
            </div>
          )}
        </div>

        {/* RESULTS */}
        <div className="bg-slate-900 p-8 rounded-3xl">

          {result && result.analysis ? (
            <div className="space-y-4">

              <p className="text-white text-xl">
                {result.analysis.dominant_emotion}
              </p>

              <p className="text-purple-400">
                {(result.analysis.confidence * 100).toFixed(2)}%
              </p>

              {result.support && (
                <p className="text-green-400 whitespace-pre-line">
                  {result.support}
                </p>
              )}

            </div>
          ) : (
            <p className="text-slate-400">Record and analyze</p>
          )}

        </div>
      </div>

      {/* ✅ FIXED BUTTON */}
      {result && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setActiveTab("assistant")}
            className="px-8 py-3 bg-green-600 text-white rounded-xl"
          >
            Talk to Assistant
          </button>
        </div>
      )}

    </div>
  );
};

export default SpeechAnalyzer;