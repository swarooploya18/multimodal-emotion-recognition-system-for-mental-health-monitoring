import React from 'react';
import { Mail, ChevronRight } from 'lucide-react';

const Settings: React.FC = () => {

  const faqs = [
    {
      q: "How does the Facial Analysis work?",
      a: "The system captures a frame from the camera and sends it to the backend for emotion classification using a trained vision model."
    },
    {
      q: "How is Speech Emotion detected?",
      a: "Audio is recorded in the browser and sent to the backend where a speech emotion model analyzes vocal tone patterns."
    },
    {
      q: "How is Risk Assessment calculated?",
      a: "Risk score is derived from the latest text, speech, and face emotion results stored in the system."
    }
  ];

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <h3 className="text-2xl font-bold text-white mb-8">
          Help & Information
        </h3>

        {/* FAQs */}
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:bg-slate-800/70 transition-colors group"
            >
              <p className="text-white font-semibold mb-2 flex justify-between items-center">
                {faq.q}
                <ChevronRight size={16} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
              </p>
              <p className="text-slate-400 text-sm leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>

        {/* Contact Developer */}
        <div className="mt-10 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-6 text-center">
          <h4 className="text-white font-bold mb-3 text-lg">
            Need Assistance?
          </h4>
          <p className="text-slate-400 text-sm mb-6">
            If you experience issues or need technical clarification,
            contact the developer directly.
          </p>

          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=emotionrecognitionn@gmail.com&su=Emotion System Support"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-colors flex items-center gap-2 mx-auto w-fit"
          >
            <Mail size={18} />
            Contact Developer
          </a>
        </div>

      </div>

    </div>
  );
};

export default Settings;
