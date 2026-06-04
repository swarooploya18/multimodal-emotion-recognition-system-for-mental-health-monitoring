import React, { useState } from "react";
import {
  User,
  Mic,
  FileText,
  ShieldAlert,
  Settings as SettingsIcon,
  LogOut,
  MessageCircle,
} from "lucide-react";

import FaceAnalyzer from "./components/FaceAnalyzer";
import SpeechAnalyzer from "./components/SpeechAnalyzer";
import TextAnalyzer from "./components/TextAnalyzer";
import RiskAssessment from "./components/RiskAssessment";
import Settings from "./components/Settings";
import AssistantPanel from "./components/AssistantPanel"; // ✅ NEW
import Login from "./Pages/Login";
import { NavItem } from "./types";
import { useAuth } from "./context/AuthContext";

const App: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  const [activeTab, setActiveTab] = useState<string>("text");

  const navItems: NavItem[] = [
    { id: "text", label: "Text Analysis", icon: <FileText size={20} /> },
    { id: "face", label: "Facial Analysis", icon: <User size={20} /> },
    { id: "speech", label: "Speech Analysis", icon: <Mic size={20} /> },
    { id: "risk", label: "Risk Assessment", icon: <ShieldAlert size={20} /> },
    { id: "assistant", label: "Assistant", icon: <MessageCircle size={20} /> }, // ✅ NEW
  ];

  
  const renderContent = () => {
  switch (activeTab) {
    case "text":
      return <TextAnalyzer setActiveTab={setActiveTab} />;
    case "face":
      return <FaceAnalyzer setActiveTab={setActiveTab} />;
    case "speech":
      return <SpeechAnalyzer setActiveTab={setActiveTab} />;
    case "risk":
      return <RiskAssessment />;
    case "assistant":
      return <AssistantPanel />;
    case "settings":
      return <Settings />;
    default:
      return <TextAnalyzer setActiveTab={setActiveTab} />;
  }
};

  const currentLabel =
    activeTab === "settings"
      ? "Settings"
      : navItems.find((n) => n.id === activeTab)?.label;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">

      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900 hidden md:flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <ShieldAlert className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold text-white">SentientAI</h1>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id
                    ? "bg-indigo-600/10 text-indigo-400"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="mt-auto p-6 border-t border-slate-800 space-y-3">
          <button
            onClick={() => setActiveTab("settings")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800/50"
          >
            <SettingsIcon size={18} />
            <span>Settings</span>
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-30 px-8 py-4 border-b border-slate-800 bg-slate-950">
          <h2 className="text-xl font-semibold text-white">
            {currentLabel}
          </h2>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;