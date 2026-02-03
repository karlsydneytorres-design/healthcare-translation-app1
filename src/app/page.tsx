'use client';

import { useState, useRef, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

type Message = {
  id: string;
  text: string;
  translatedText: string;
  audioUrl?: string;
  role: 'doctor' | 'patient';
  timestamp: Date;
};

export default function Home() {
  const [role, setRole] = useState<'doctor' | 'patient' | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!role) return;
    const q = query(collection(db, 'conversations'), orderBy('timestamp'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
    });
    return unsubscribe;
  }, [role]);

  const translateText = async (text: string, fromRole: 'doctor' | 'patient') => {
    const toLang = fromRole === 'doctor' ? 'es' : 'en'; // Simple: doctor speaks English, patient Spanish
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, toLang }),
    });
    const data = await response.json();
    return data.translatedText;
  };

  const sendMessage = async (text: string, audioUrl?: string) => {
    if (!role) return;
    const translatedText = await translateText(text, role);
    const docData: any = {
      text,
      translatedText,
      role,
      timestamp: new Date(),
    };
    if (audioUrl) {
      docData.audioUrl = audioUrl;
    }
    await addDoc(collection(db, 'conversations'), docData);
  };

  const handleSend = async () => {
    if (input.trim()) {
      await sendMessage(input);
      setInput('');
    }
  };

  const generateSummary = async () => {
    const conversationText = messages.map(m => `${m.role}: ${m.text}`).join('\n');
    const response = await fetch('/api/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: conversationText }),
    });
    const data = await response.json();
    alert(data.summary); // Simple alert, could be a modal
  };

  const filteredMessages = messages.filter(m =>
    m.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.translatedText.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!role) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl mb-4">Select Your Role</h1>
          <button onClick={() => setRole('doctor')} className="bg-blue-500 text-white px-4 py-2 mr-4">Doctor</button>
          <button onClick={() => setRole('patient')} className="bg-green-500 text-white px-4 py-2">Patient</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-xl font-bold">Healthcare Translation App</h1>
        {role && <p className="text-sm">Logged in as: <span className="font-semibold">{role === 'doctor' ? 'Doctor' : 'Patient'}</span></p>}
      </header>
      {role ? (
        <div className="flex flex-col flex-1 max-w-4xl mx-auto w-full p-4">
          <div className="flex-1 bg-white rounded-lg shadow-md p-4 mb-4 overflow-y-auto max-h-96">
            {filteredMessages.map((msg) => (
              <div key={msg.id} className={`mb-4 flex ${msg.role === role ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs p-3 rounded-lg ${msg.role === role ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                  <p className="text-sm font-semibold">{msg.role === 'doctor' ? 'Doctor' : 'Patient'}:</p>
                  <p>{msg.text}</p>
                  <p className="text-xs italic mt-1">{msg.translatedText}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border rounded mb-2"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 p-2 border rounded"
                placeholder="Type a message..."
              />
              <button onClick={handleSend} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Send</button>
              <button onClick={generateSummary} className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">Summary</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-1">
          <h2 className="text-2xl font-bold mb-4">Select Your Role</h2>
          <div className="flex gap-4">
            <button onClick={() => setRole('doctor')} className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600">Doctor</button>
            <button onClick={() => setRole('patient')} className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600">Patient</button>
          </div>
        </div>
      )}
    </div>
  );
}
