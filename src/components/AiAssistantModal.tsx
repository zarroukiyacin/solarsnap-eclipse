import React, { useState } from 'react';
import { Bot, Send, Sparkles, Image as ImageIcon, X, RefreshCw, MessageSquare, AlertCircle } from 'lucide-react';
import { AiChatMessage, CameraSettings, EclipsePhase, FilterType } from '../types';

interface AiAssistantModalProps {
  currentPhase: EclipsePhase;
  currentFilter: FilterType;
  cameraSettings: CameraSettings;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  currentPhase,
  currentFilter,
  cameraSettings,
}) => {
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: "Bonjour ! Je suis votre assistant astrophotographe SolarSnap. Posez-moi des questions sur les réglages pour l'éclipse, le choix des filtres ou la sécurité oculaire.",
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedPhotoBase64, setSelectedPhotoBase64] = useState<string | null>(null);

  // Send message to Gemini API endpoint
  const handleSendMessage = async (customText?: string) => {
    const promptToSend = customText || inputPrompt;
    if (!promptToSend.trim() && !selectedPhotoBase64) return;

    const userMsg: AiChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: promptToSend,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      photoUrl: selectedPhotoBase64 || undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          eclipsePhase: currentPhase,
          filterType: currentFilter,
          cameraSettings: {
            iso: cameraSettings.iso,
            exposure: cameraSettings.exposureEV,
            zoom: cameraSettings.zoom,
          },
          userImageBase64: selectedPhotoBase64,
        }),
      });

      const data = await response.json();

      if (data.result) {
        const aiMsg: AiChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: data.result,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error(data.error || 'Pas de réponse reçue');
      }
    } catch (err: any) {
      const errorMsg: AiChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ Désolé, une erreur est survenue: ${err.message || 'Problème de connexion'}. Vérifiez votre clé API Gemini dans l'environnement.`,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setSelectedPhotoBase64(null);
    }
  };

  // Quick Preset Questions
  const quickQuestions = [
    'Quels réglages pour capturer les grains de Baily ?',
    'Quand dois-je exactement retirer mon filtre SolarSnap ?',
    'Comment réussir la photo de l\'anneau de diamant ?',
    'Conseils pour le timelapse automatique.',
  ];

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col overflow-hidden text-xs">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-slate-100 text-xs">Assistant Astrophotographe IA</h2>
            <p className="text-[9px] text-slate-400">Propulsé par Gemini • Expert SolarSnap</p>
          </div>
        </div>
      </div>

      {/* Chat Messages History */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-2xl text-[11px] leading-relaxed space-y-1.5 shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}
            >
              {msg.photoUrl && (
                <img
                  src={msg.photoUrl}
                  alt="Analyse"
                  className="w-full h-32 object-cover rounded-xl mb-1.5 border border-slate-800"
                />
              )}
              <div className="whitespace-pre-line">{msg.text}</div>
              <div
                className={`text-[8px] text-right font-mono ${
                  msg.sender === 'user' ? 'text-slate-800' : 'text-slate-500'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-amber-400 bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800 max-w-[70%]">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span className="text-[10px]">Analyse de l'expert en cours...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-2 py-1.5 bg-slate-900/60 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto shrink-0">
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-1 rounded-full text-[10px] whitespace-nowrap transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-2 bg-slate-900 border-t border-slate-800 flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Posez votre question à l'assistant d'éclipse..."
          className="flex-1 bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500"
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={loading || !inputPrompt.trim()}
          className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold p-2 rounded-xl transition-colors shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
