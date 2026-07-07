# ⚔️ AI Battle Arena

<p align="center">
  <strong>Battle Multiple AI Models. Compare Responses. Let an AI Judge Decide the Winner.</strong>
</p>

<p align="center">
  Submit a prompt once, receive responses from two AI models simultaneously, and get an unbiased AI-powered evaluation with scores, reasoning, strengths, weaknesses, and an overall winner.
</p>

---

## 🚀 Live Demo

🌐 **Application:** https://ai-battle-arena-1-vmha.onrender.com

---

## 📌 Overview

AI Battle Arena is an AI comparison platform that allows users to evaluate how different Large Language Models (LLMs) respond to the same prompt.

Instead of switching between multiple AI websites manually, users can compare responses side-by-side in one interface while an independent Judge AI analyzes both responses and determines the better answer based on multiple evaluation criteria.

This project was built to simplify AI comparison for developers, students, researchers, and AI enthusiasts.

---

## ✨ Features

* 🤖 Compare responses from two AI models simultaneously
* ⚡ Supports both text prompts and website URLs
* 🧠 AI-powered Judge evaluates both responses
* 📊 Detailed scoring system
* 🏆 Automatic winner selection
* 📖 Explanation for every score
* 🎯 Side-by-side response comparison
* 🔐 Google OAuth Authentication
* 👤 User Profile Management
* 📜 Battle History
* 📱 Fully Responsive UI
* 🌙 Modern dark-themed interface
* ⚡ Fast API communication
* 🔒 Secure backend with authentication

---

# ⚙️ How It Works

```text
User Prompt / URL
        │
        ▼
Frontend
        │
        ▼
Backend API
        │
 ┌──────┴────────┐
 ▼               ▼
AI Model 1    AI Model 2
 │               │
 └──────┬────────┘
        ▼
    Judge AI
        │
        ▼
Scores + Winner + Reasoning
        │
        ▼
Frontend Results Page
```

---

# 🧠 Judge AI Evaluation

The Judge AI analyzes both responses independently using factors such as:

* Accuracy
* Completeness
* Relevance
* Clarity
* Depth
* Creativity
* Structure
* Practicality
* Overall Quality

After evaluation, the Judge AI provides:

* Individual Scores
* Strengths
* Weaknesses
* Detailed Analysis
* Winner Declaration

---

# 🛠 Tech Stack

## Frontend

* React
* Vite
* Tailwind CSS
* React Router
* Framer Motion
* Axios

---

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Google OAuth
* Express Session
* Cookie Parser

---

## AI APIs

* Gemini API
* OpenRouter API

---

## Deployment

* Vercel (Frontend)
* Render (Backend)
* MongoDB Atlas

---

# 📂 Project Structure

```bash
AI-BATTLE-ARENA/
│
├── Frontend/
│   ├── src/
│   ├── public/
│   ├── assets/
│   └── components/
│
├── Backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── utils/
│   └── config/
│
├── README.md
└── package.json
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/AI-Battle-Arena.git
```

```bash
cd AI-Battle-Arena
```

---

## Install Frontend

```bash
cd Frontend
npm install
npm run dev
```

---

## Install Backend

```bash
cd Backend
npm install
npm run dev
```

---

# 🔑 Environment Variables

Create a `.env` file inside the Backend folder.

```env
PORT=

MONGODB_URI=

JWT_SECRET=

GOOGLE_CLIENT_ID=

GOOGLE_CLIENT_SECRET=

SESSION_SECRET=

GEMINI_API_KEY=

OPENROUTER_API_KEY=

FRONTEND_URL=
```

Create a `.env` file inside the Frontend folder.

```env
VITE_API_URL=
```

---

# 📡 API Workflow

```
User Input

↓

Backend receives request

↓

Prompt sent to AI Model 1

↓

Prompt sent to AI Model 2

↓

Responses collected

↓

Judge AI evaluates both

↓

Scores generated

↓

Winner declared

↓

Frontend displays results
```

---

# 🎯 Use Cases

* Compare AI models
* Prompt Engineering
* AI Research
* Student Learning
* Coding Assistance
* Content Generation
* AI Evaluation
* LLM Benchmarking

---

# 🌟 Future Improvements

* Multiple AI model selection
* Streaming responses
* Battle sharing
* Leaderboards
* AI Rankings
* Prompt Templates
* Export battle results
* Battle statistics dashboard
* Voice input
* Image prompt support
* Dark/Light themes
* Team battles

---

# 🤝 Contributing

Contributions are always welcome.

1. Fork the repository

2. Create a feature branch

```bash
git checkout -b feature-name
```

3. Commit your changes

```bash
git commit -m "Added new feature"
```

4. Push to GitHub

```bash
git push origin feature-name
```

5. Open a Pull Request

---

# 📄 License

This project is licensed under the MIT License.

---

# 🙌 Acknowledgements

Special thanks to:

* Google Gemini
* OpenRouter
* React
* Vite
* Tailwind CSS
* Express.js
* MongoDB Atlas
* Render
* Vercel

---

# ⭐ Support

If you found this project helpful:

⭐ Star this repository

🍴 Fork it

🐞 Report issues

💡 Suggest new features

---

<p align="center">
Built with ❤️ by <strong>Pushkar Rawat</strong>

If you like this project, don't forget to ⭐ the repository!

</p>
