import React, { useRef, useState, useEffect } from "react";
import { Camera, RefreshCw, AlertCircle } from "lucide-react";

const BACKEND_URL = "http://127.0.0.1:8000";

const FaceAnalyzer: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loadingCamera, setLoadingCamera] = useState(false);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      setLoadingCamera(true);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      setStream(mediaStream);
    } catch {
      alert("Allow camera access");
    } finally {
      setLoadingCamera(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current) return;

    setAnalyzing(true);
    setResult(null);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx?.drawImage(videoRef.current, 0, 0);

      const blob: Blob = await new Promise(resolve =>
        canvas.toBlob(b => resolve(b!), "image/jpeg")
      );

      const formData = new FormData();
      formData.append("student_id", "student_001");
      formData.append("file", blob);

      const response = await fetch(`${BACKEND_URL}/api/analyze-face`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data);

    } catch {
      alert("Face analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">

      <div className="flex flex-col lg:flex-row gap-8">

        {/* CAMERA */}
        <div className="flex-1">
          {!stream ? (
            <button onClick={startCamera} className="bg-indigo-600 px-4 py-2 text-white">
              Start Camera
            </button>
          ) : (
            <video ref={videoRef} autoPlay className="w-full rounded-xl" />
          )}

          <div className="flex gap-4 mt-4">
            <button
              onClick={captureAndAnalyze}
              disabled={!stream}
              className="bg-indigo-600 px-4 py-2 text-white"
            >
              Analyze
            </button>

            <button onClick={stopCamera} className="bg-slate-700 px-4 py-2 text-white">
              Stop
            </button>
          </div>
        </div>

        {/* RESULT */}
        <div className="bg-slate-900 p-6 rounded-xl w-80">

          {result && result.analysis ? (
            <>
              <p className="text-white text-xl">
                {result.analysis.dominant_emotion}
              </p>

              <p className="text-slate-400">
                {(result.analysis.confidence * 100).toFixed(2)}%
              </p>

              {result.support && (
                <p className="text-green-400 mt-4 whitespace-pre-line">
                  {result.support}
                </p>
              )}
            </>
          ) : (
            <p className="text-slate-400">No result</p>
          )}

        </div>
      </div>

      {/* ✅ FIXED BUTTON */}
      {result && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setActiveTab("assistant")}
            className="px-6 py-3 bg-green-600 text-white rounded-xl"
          >
            Talk to Assistant
          </button>
        </div>
      )}

    </div>
  );
};

export default FaceAnalyzer;