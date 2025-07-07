import React, { useState, useEffect } from 'react';
import { sendMessage, getAssistantPort } from './api';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    getAssistantPort();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages([...messages, userMsg]);
    setInput('');
    try {
      const response = await sendMessage(input);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'error', content: e.message }]);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <div className="h-96 overflow-y-auto bg-gray-800 p-4 rounded">
        {messages.map((msg, i) => (
          <div key={i} className={`my-2 ${msg.role === 'user' ? 'text-blue-400' : msg.role === 'assistant' ? 'text-green-400' : 'text-red-400'}`}>{msg.role}: {msg.content}</div>
        ))}
      </div>
      <div className="mt-4 flex">
        <input value={input} onChange={e => setInput(e.target.value)} className="flex-1 p-2 bg-gray-700 text-white rounded-l" placeholder="Type a message..." />
        <button onClick={handleSend} className="px-4 bg-indigo-500 rounded-r">Send</button>
      </div>
    </div>
  );
};

export default App;
