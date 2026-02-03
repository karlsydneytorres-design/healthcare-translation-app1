# Healthcare Doctor–Patient Translation Web Application

## Project Overview
This is a full-stack web application that acts as a real-time translation bridge between a doctor and a patient. It supports text chat, audio recording, conversation logging, search, and AI-powered summarization.

## Features Attempted and Completed
- ✅ Real-Time Doctor–Patient Translation (using OpenAI)
- ✅ Text Chat Interface
- ✅ Audio Recording & Storage (using Firebase Storage)
- ✅ Conversation Logging (using Firebase Firestore)
- ✅ Conversation Search
- ✅ AI-Powered Summary (using OpenAI)

## Tech Stack Used
- Frontend: Next.js, React, Tailwind CSS
- Backend: Next.js API Routes
- Database: Firebase Firestore
- Storage: Firebase Storage
- AI: OpenAI API

## AI Tools and Resources Leveraged
- OpenAI GPT-3.5-turbo for translation and summarization
- Firebase for data persistence

## Known Limitations, Trade-offs, or Unfinished Parts
- Audio transcription is not implemented; audio messages are labeled as "Audio message" without text.
- Simple language assumption: Doctor speaks English, Patient speaks Spanish.
- No authentication; anyone can access as doctor or patient.
- Search is client-side only.
- Summary shown in alert; no proper UI.
- Requires API keys for OpenAI and Firebase setup.

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env.local`:
   ```
   OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Deployed Live Link
[Deploy on Vercel](https://vercel.com) or other platform.
