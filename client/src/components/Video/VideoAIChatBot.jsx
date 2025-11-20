import React, { useState } from 'react';
import { X } from 'lucide-react';

const VideoAIChatBot = ({ videoTitle, videoId }) => {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: `Hi! Ask me anything about "${videoTitle}".` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(true);
  const [error, setError] = useState(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages([...messages, { sender: 'user', text: input }]);
    setLoading(true);
    setError(null);
    try {
      // Replace with your AI API endpoint
      const res = await fetch('/api/ai/video-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, question: input })
      });
      if (!res.ok) throw new Error('AI server error');
      const data = await res.json();
      setMessages(msgs => [...msgs, { sender: 'ai', text: data.answer || 'Sorry, I could not help with that.' }]);
    } catch (err) {
      setError('Error connecting to AI assistant.');
      setMessages(msgs => [...msgs, { sender: 'ai', text: 'Error connecting to AI assistant.' }]);
    }
    setInput('');
    setLoading(false);
  };

  if (!visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        style={{ background: 'linear-gradient(90deg,#38bdf8,#0ea5e9)', border: 'none', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #38bdf822', cursor: 'pointer', position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}
        title="Open AI Chatbot"
      >
        <img src="https://cdn-icons-png.flaticon.com/512/4712/4712027.png" alt="AI" style={{ width: 28, height: 28 }} />
      </button>
    );
  }

  return (
    <div className="video-ai-chatbot" style={{ background: '#18181b', borderRadius: 16, boxShadow: '0 4px 24px #0002', padding: 20, maxWidth: 400, width: '100%', border: '1px solid #27272a', position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h4 style={{ color: '#38bdf8', fontWeight: 600, fontSize: 18 }}>AI Assistant</h4>
        <button onClick={() => setVisible(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} title="Close">
          <X size={22} color="#38bdf8" />
        </button>
      </div>
      <div style={{ maxHeight: 220, overflowY: 'auto', marginBottom: 12, paddingRight: 4 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', margin: '6px 0' }}>
            <span style={{
              background: msg.sender === 'user' ? 'linear-gradient(90deg,#38bdf8,#0ea5e9)' : '#27272a',
              color: msg.sender === 'user' ? '#fff' : '#d1d5db',
              padding: '8px 14px',
              borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              fontSize: 15,
              maxWidth: '80%',
              boxShadow: msg.sender === 'user' ? '0 2px 8px #38bdf822' : '0 2px 8px #27272a22',
              wordBreak: 'break-word',
              border: msg.sender === 'user' ? '1px solid #38bdf8' : '1px solid #27272a'
            }}>{msg.text}</span>
          </div>
        ))}
        {error && (
          <div style={{ color: '#ef4444', fontSize: 14, marginTop: 8, textAlign: 'center' }}>{error}</div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about this video..."
          style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #27272a', background: '#23232a', color: '#fff', fontSize: 15, outline: 'none' }}
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            background: loading ? '#38bdf822' : 'linear-gradient(90deg,#38bdf8,#0ea5e9)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 18px',
            fontWeight: 600,
            fontSize: 15,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 8px #38bdf822',
            transition: 'background 0.2s'
          }}
        >
          {loading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default VideoAIChatBot;
