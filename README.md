# Infollion Chatbot - Software Developer Intern Task

A state-of-the-art, minimal web-based chatbot powered by Google's Gemini 2.5 Flash API. Built as part of the Infollion Software Developer Intern assignment, this application supports seamless text, document, and image processing within isolated conversational contexts.

**Live Deployment:** https://infollion-chatbot.vercel.app/

---

## Features

### Core Requirements
* Multimodal Chat Interface: Natural text conversation alongside PDF, TXT, PNG, and JPG uploads.
* Isolated Contextual Memory: Complete chat history tracking mapped to unique session IDs. Context does not bleed between different conversations.
* Session Reset: "New Chat" functionality to initialize a fresh context timeline.

### Premium & Bonus Enhancements
* Multi-Session Sidebar: Persists and lists multiple active chats during the server lifecycle.
* Auto-Titling: Dynamically generates chat titles based on the user's first prompt.
* Optimistic UI & Inline Previews: Displays image and document thumbnails in the input area prior to sending, and locks attachments natively into the chat bubbles post-submission.
* Session Management: Rename and cleanly delete active sessions via a custom confirmation modal.
* Industrial Dark Mode UI: Deep slate/zinc palette with glass-morphism effects, responsive collapsible sidebars, and fluid layout transitions.

---

## Technology Stack

### Frontend
* React (Vite): Lightning-fast development server and optimized build processes.
* Tailwind CSS v4: Utility-first styling for a maintainable, custom design system.
* React Markdown: Safely renders rich-text Markdown responses generated natively by the Gemini API.

### Backend
* Node.js & Express: Lightweight, high-performance HTTP server handling multipart form data.
* Multer (Memory Storage): Intercepts and holds uploaded files entirely in RAM (Buffer), avoiding complex file system storage constraints.
* @google/generative-ai: Official SDK for integrating the `gemini-2.5-flash` model.

---

## Architectural Decisions & Problem Solving

1. Native Multimodal PDF Parsing:
Instead of relying on fragile third-party extraction libraries like `pdf-parse`, the architecture leverages Gemini 2.5 Flash's native multimodal capabilities. The raw PDF buffer is passed directly into the model's `inlineData` payload, allowing the AI to "see" the PDF (including charts and layouts) rather than just reading scraped strings.

2. Chronological History Injection:
To prevent the model from hallucinating old images in new prompts, the backend dynamically reconstructs the Gemini SDK `history` array. Binary file buffers are mapped strictly to the historical turn in which they were uploaded, maintaining accurate conversational chronology.

3. Taming "Ghost Crops" (AI Hallucinations):
High-resolution images are internally tiled by Gemini. To prevent the model from mentioning these internal crops to the user, a strict `systemInstruction` was injected to enforce a unified response.

4. Overcoming Caching & Region Blocks:
Implemented timestamp query parameters to bust aggressive Vercel Edge caching on `GET` requests, and deployed the Render backend to a US-based region to bypass Google's geographical API blocks.

---

## Setup & Installation Instructions

### Prerequisites
* Node.js (v18+ recommended)
* A valid Google Gemini API Key

### 1. Backend Setup
Open your terminal and navigate to the backend directory:
cd backend
npm install

Create a `.env` file in the root of the `backend` folder and add your Gemini API key and port:
PORT=5000
GEMINI_API_KEY=your_actual_api_key_here

Start the backend development server:
npm run dev

### 2. Frontend Setup
Open a new terminal tab and navigate to the frontend directory:
cd frontend
npm install

(Optional) Create a `.env` file in the `frontend` folder if testing a deployed backend, otherwise it defaults to localhost:
VITE_API_URL=http://localhost:5000/api

Start the frontend development server:
npm run dev

---

## Usage Guide
1. Open `http://localhost:5173` (or your Vite port) in your browser.
2. Type a message or use the attachment icons in the input bar to upload a PDF, TXT, PNG, or JPG.
3. Press Send (or Enter) to see the multimodal analysis.
4. Click "New Chat" in the sidebar to start a fresh, isolated conversation.
5. Hover over existing chats in the sidebar to rename or delete them.