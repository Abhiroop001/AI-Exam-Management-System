# 🎓 AI-Powered Student & Teacher Exam Management Platform

A production-grade, development-ready **MERN Stack + TypeScript** exam management platform with full-screen, responsive, crisp white interfaces, animated background motion via **Framer Motion**, and an automated multi-provider AI pipeline.

---

## 🌟 Key Features

### 1. 👨‍🏫 Teacher Studio (`http://localhost:5173`)
- **Full-Screen Authoring**: Author Single MCQ, Multiple MCQ, and in-depth Long Answer questions with remarks and model keys.
- **Multimodal File Attachments**: Attach Diagrams, PDFs, Spreadsheets, and Source Code files (`.c`, `.py`, `.java`, etc.).
- **Automated Linguistic Polish**: Single-click academic clarity index, typo elimination, and phrasing improvements.
- **Dynamic QR Code Generation**: Automated high-contrast scannable QR code generation with custom expiration limits.
- **Live Proctoring Radar**: Real-time heartbeat monitoring of active students taking the test.
- **In-Depth Cohort & Individual Diagnostics**: Pedagogical recommendations and class-wide topic mastery metrics.

### 2. 👨‍🎓 Student Arena (`http://localhost:5174`)
- **Zero-Friction Access**: Scan the QR code or enter the 6-character code to join the live testing room.
- **Interactive Full-Screen Arena**: Animated top bar with countdown timer, flagged questions, jump-to-question drawer, and syntax code viewer.
- **5-Minute Animated AI Diagnostic Window**: Post-submission multi-step pipeline stepper analyzing responses.
- **Comprehensive Assessment Report**: Score summary ring, curriculum concept mastery breakdown, personalized learning roadmap, and question-by-question comparative audit.

---

## 🏗️ Architecture & Ports

| Component | Port | Framework | Role |
| :--- | :--- | :--- | :--- |
| **Teacher Dashboard** | `5173` | React 18 + Vite + TS + Tailwind | Educator exam authoring & analytics studio |
| **Student Dashboard** | `5174` | React 18 + Vite + TS + Tailwind | Student examination arena & report viewer |
| **Backend API** | `5000` | Node.js + Express + TS + MongoDB | REST API, proctoring heartbeat & AI pipeline |

---

## 🚀 Local Development Setup

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Configure Environment (`.env`)
Create a `.env` in the root directory (refer to `.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/exam_management
JWT_SECRET=super_secret_exam_mgmt_jwt_token_2026

GROQ_API_KEY=gsk_...
HUGGINGFACE_API_KEY=hf_...
GEMINI_API_KEY=...
OPENROUTER_API_KEY=sk-or-v1-...
MISTRAL_API_KEY=...

CLIENT_TEACHER_URL=http://localhost:5173
CLIENT_STUDENT_URL=http://localhost:5174
```

### 3. Launch Development Servers
```bash
npm run dev
```

---

## ☁️ Deployment Guide

### A. Deploy Backend to Render (via GitHub or CLI)

The project includes a root `render.yaml` blueprint.

1. **Push this repository to GitHub** (see GitHub CLI section below).
2. Go to [Render Dashboard](https://dashboard.render.com/) $\rightarrow$ **Blueprints** $\rightarrow$ **New Blueprint Instance**.
3. Select this repository. Render automatically reads `render.yaml`:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. In the Render Environment tab, add your live secrets:
   - `MONGO_URI`
   - `GROQ_API_KEY`
   - `GEMINI_API_KEY`
   - `HUGGINGFACE_API_KEY`
   - `OPENROUTER_API_KEY`
   - `CLIENT_TEACHER_URL` (your teacher Vercel domain)
   - `CLIENT_STUDENT_URL` (your student Vercel domain)

### B. Deploy Frontends to Vercel (via Vercel CLI)

Both frontends include `vercel.json` with SPA routing rules.

#### 1. Deploy Teacher Dashboard
```bash
cd frontend-teacher
vercel --prod
```
Set environment variables in Vercel project settings:
- `VITE_API_URL` = `https://<your-render-backend-url>.onrender.com/api`
- `VITE_SERVER_URL` = `https://<your-render-backend-url>.onrender.com`

#### 2. Deploy Student Dashboard
```bash
cd frontend-student
vercel --prod
```
Set environment variables in Vercel project settings:
- `VITE_API_URL` = `https://<your-render-backend-url>.onrender.com/api`
- `VITE_SERVER_URL` = `https://<your-render-backend-url>.onrender.com`

---

## 🧪 Automated Verification Suite
Run the full 16-endpoint end-to-end integration test:
```bash
cd backend
npm run test:apis
```
Run the multi-model AI pipeline verification:
```bash
cd backend
npx tsx src/utils/testProviderIntegration.ts
```
