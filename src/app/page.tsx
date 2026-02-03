'use client';

import { useState, useRef, useEffect } from 'react';
import { db, storage } from '../lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
  const [isRecording, setIsRecording] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      const audioRef = ref(storage, `audio/${Date.now()}.wav`);
      await uploadBytes(audioRef, audioBlob);
      const url = await getDownloadURL(audioRef);
      // For simplicity, assume audio is transcribed to text, but here just send empty text with audio
      await sendMessage('Audio message', url);
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
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
    <div className="flex flex-col min-h-screen">
      <header className="bg-gray-100 p-4">
        <h1 className="text-xl">Healthcare Translation App - {role === 'doctor' ? 'Doctor' : 'Patient'}</h1>
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mt-2 p-2 border"
        />
        <button onClick={generateSummary} className="ml-4 bg-purple-500 text-white px-4 py-2">Generate Summary</button>
      </header>
      <div className="flex-1 p-4 overflow-y-auto">
        {filteredMessages.map((msg) => (
          <div key={msg.id} className={`mb-4 p-2 rounded ${msg.role === role ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <p><strong>{msg.role}:</strong> {msg.text}</p>
            <p><em>Translated:</em> {msg.translatedText}</p>
            {msg.audioUrl && <audio controls src={msg.audioUrl} />}
          </div>
        ))}
      </div>
      <div className="p-4 border-t">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 p-2 border mr-2"
          placeholder="Type a message..."
        />
        <button onClick={handleSend} className="bg-blue-500 text-white px-4 py-2 mr-2">Send</button>
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`px-4 py-2 ${isRecording ? 'bg-red-500' : 'bg-green-500'} text-white`}
        >
          {isRecording ? 'Stop Recording' : 'Record Audio'}
        </button>
      </div>
    </div>
  );
}
