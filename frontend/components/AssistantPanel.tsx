import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";

interface Props {
  emotion?: string;
}

const AssistantPanel: React.FC<Props> = ({ emotion = "sad" }) => {

  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [support, setSupport] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // --------------------------------
  // CHATBOT FUNCTION
  // --------------------------------

  const sendMessage = async () => {

    if (!input.trim()) return;

    const userMessage = { role: "user" as const, text: input };

    setMessages((prev) => [...prev, userMessage]);

    setInput("");

    setLoading(true);

    try {

      const response = await fetch("http://127.0.0.1:8000/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: input })
      });

      const data = await response.json();

      const botMessage = {
        role: "assistant" as const,
        text: data.response
      };

      setMessages((prev) => [...prev, botMessage]);

    } catch {

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Unable to connect to assistant." }
      ]);

    }

    setLoading(false);

  };

  // --------------------------------
  // SUPPORT SUMMARY FUNCTION
  // --------------------------------

  const generateSupport = async () => {

    try {

      const response = await fetch("http://127.0.0.1:8000/api/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ emotion })
      });

      const data = await response.json();

      setSupport(data.response);

    } catch {

      setSupport("Unable to generate emotional support right now.");

    }

  };

  return (

    <div className="h-full flex flex-col bg-slate-950">

      {/* Header */}

      <div className="p-5 border-b border-slate-800 bg-slate-900 flex items-center gap-3">

        <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center">
          <Bot size={18} className="text-white" />
        </div>

        <div>

          <h2 className="font-semibold text-white text-lg">
            Mental Health Assistant
          </h2>

          <p className="text-xs text-slate-400">
            Emotional support • Not a replacement for professionals
          </p>

        </div>

      </div>

      {/* Support Buttons */}

      <div className="p-5 border-b border-slate-800 bg-slate-900 flex gap-3">

        <button
          onClick={generateSupport}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm"
        >
          Generate Support Summary
        </button>

      </div>

      {/* Support Output */}

      {support && (

        <div className="p-5 bg-slate-900 border-b border-slate-800">

          <div className="bg-slate-800 p-4 rounded-lg text-sm text-slate-200 whitespace-pre-line">

            {support}

          </div>

        </div>

      )}

      {/* Chat Area */}

      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {messages.map((msg, index) => (

          <div
            key={index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >

            <div className="flex items-end gap-2 max-w-lg">

              {msg.role === "assistant" && (

                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                  <Bot size={14} className="text-white" />
                </div>

              )}

              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-md ${
                  msg.role === "assistant"
                    ? "bg-slate-800 text-slate-200 rounded-bl-none"
                    : "bg-indigo-600 text-white rounded-br-none"
                }`}
              >
                {msg.text}
              </div>

              {msg.role === "user" && (

                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                  <User size={14} className="text-white" />
                </div>

              )}

            </div>

          </div>

        ))}

        {loading && (

          <div className="flex items-center gap-2 text-slate-400 text-sm">

            <Bot size={16} />

            Assistant is typing...

          </div>

        )}

        <div ref={bottomRef} />

      </div>

      {/* Chat Input */}

      <div className="p-4 border-t border-slate-800 bg-slate-900">

        <div className="flex items-center bg-slate-800 rounded-full px-4 py-2">

          <input
            className="flex-1 bg-transparent outline-none text-sm text-white placeholder-slate-400"
            placeholder="Share how you're feeling..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <button
            onClick={sendMessage}
            className="ml-3 p-2 bg-indigo-600 rounded-full hover:bg-indigo-500 transition"
          >
            <Send size={16} className="text-white" />
          </button>

        </div>

      </div>

    </div>

  );
};

export default AssistantPanel;