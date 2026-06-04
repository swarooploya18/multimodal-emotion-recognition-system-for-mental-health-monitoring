import React, { useState } from "react";
import { TrendingUp, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";

const BACKEND_URL = "http://127.0.0.1:8000";

const RiskAssessment: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [riskData, setRiskData] = useState<any>(null);

  const fetchRisk = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/analyze-risk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          student_id: "student_001"
        })
      });

      const data = await response.json();
      console.log("Risk Response:", data);

      setRiskData(data);

    } catch (error) {
      console.error("Risk analysis failed:", error);
      alert("Risk analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const riskScore = riskData ? riskData.score : 0;
  const riskLevel = riskData ? riskData.risk_level : "LOW";

  const circleDash = 251.2;
  const dashOffset = circleDash * (1 - riskScore);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

        {/* Risk Score Gauge */}
        <div className="md:col-span-5 bg-slate-900 border border-slate-800 p-10 rounded-3xl text-center flex flex-col items-center justify-center shadow-xl">

          <div className="flex items-center gap-3 mb-8 self-start">
            <div className="p-2 bg-indigo-600/20 rounded-lg text-indigo-400">
              <ShieldAlert size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">
              Consolidated Risk Score
            </h3>
          </div>

          <div className="relative w-64 h-64 mb-8">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                className="text-slate-800"
                strokeWidth="6"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
              />
              <circle
                className="text-indigo-500"
                strokeWidth="6"
                strokeDasharray={circleDash}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
                style={{ filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.4))' }}
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold text-white font-outfit tracking-tighter">
                {riskLevel}
              </span>
              <span className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-2">
                Stability Index
              </span>
            </div>
          </div>

          <div className={`p-5 rounded-2xl w-full flex items-center gap-4 ${
            riskScore > 0.7
              ? "bg-red-500/10 border border-red-500/20"
              : riskScore > 0.4
              ? "bg-yellow-500/10 border border-yellow-500/20"
              : "bg-green-500/10 border border-green-500/20"
          }`}>

            <div className="w-10 h-10 rounded-full flex items-center justify-center">
              {riskScore > 0.7 ? (
                <AlertTriangle className="text-red-500" size={20} />
              ) : (
                <CheckCircle2 className="text-green-500" size={20} />
              )}
            </div>

            <div className="text-left">
              <p className="text-sm font-bold text-white">
                Score: {(riskScore * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-slate-400">
                {riskData?.recommendation || "Run assessment to see recommendation."}
              </p>
            </div>
          </div>

          <button
            onClick={fetchRisk}
            disabled={loading}
            className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Refresh Report"}
          </button>

        </div>

        {/* Forecast Section */}
        <div className="md:col-span-7 space-y-6">

          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl h-full shadow-lg">
            <h3 className="text-xl font-bold text-white mb-6">
              Risk Forecasting
            </h3>

            {riskData ? (
              <div className="space-y-6">

                <div className="p-6 bg-slate-800/40 rounded-2xl border border-slate-700">
                  <h4 className="text-lg font-bold text-white mb-2">
                    Dominant Emotion Influence
                  </h4>
                  <p className="text-slate-400 text-sm">
                    Most recent dominant emotion:
                  </p>
                  <p className="text-indigo-400 font-bold mt-2">
                    {riskData.dominant_emotion || "N/A"}
                  </p>
                </div>

                <div className="p-6 bg-slate-800/40 rounded-2xl border border-slate-700">
                  <h4 className="text-lg font-bold text-white mb-2">
                    Risk Interpretation
                  </h4>
                  <p className="text-slate-400 text-sm">
                    {riskData.interpretation || "No interpretation provided."}
                  </p>
                </div>

              </div>
            ) : (
              <div className="text-slate-500 text-sm">
                Run assessment to generate forecasting insights.
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};

export default RiskAssessment;
