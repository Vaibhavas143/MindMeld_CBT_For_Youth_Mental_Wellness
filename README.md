# MindMeld---AI-CBT-for-Teenager-s-Mental-Health
MindMeld – GenAI-based Conversational CBT Therapist for Teenagers 🧠💬
MindMeld is an AI-powered conversational CBT (Cognitive Behavioral Therapy) assistant designed to help teenagers manage stress, anxiety, and negative thoughts.
It blends Generative AI, Natural Language Processing, and emotion detection to provide a supportive, empathetic, and safe digital mental health companion.

🚀 Features
🗣 Real-time Chat – Seamless two-way conversation with the AI therapist.

🎭 Emotion Detection – Understands the emotional tone of the user’s message.

🧠 CBT-based Guidance – Uses structured therapy techniques to help users reframe thoughts.

🌍 Web Interface – Clean and user-friendly UI for easy interaction.

🔒 Privacy First – No conversations are stored unless explicitly enabled.

⚡ Local & Cloud Hosting – Run locally or deploy online for remote access.

🛠 Tech Stack
Backend
Python (Flask, Flask-CORS)

Google Gemini API for Generative AI

VOSK for offline voice recognition (optional)

Pyttsx3 for text-to-speech (optional)

scikit-learn / NLP models for emotion detection

Frontend
HTML / CSS / JavaScript

Bootstrap / TailwindCSS (for styling)

Fetch API for backend communication

📦 Installation
1️⃣ Clone the repository

bash
Copy
Edit
git clone https://github.com/yourusername/mindmeld.git
cd mindmeld
2️⃣ Set up Python virtual environment

bash
Copy
Edit
python -m venv venv
venv\Scripts\activate   # On Windows
source venv/bin/activate  # On Mac/Linux
3️⃣ Install dependencies

bash
Copy
Edit
pip install -r requirements.txt
4️⃣ Set up environment variables
Create a .env file in the backend directory:

env
Copy
Edit
GEMINI_API_KEY=your_gemini_api_key_here
5️⃣ Run the backend

bash
Copy
Edit
cd backend
python app.py
6️⃣ Run the frontend
Open index.html in your browser or use localtunnel for external access:

bash
Copy
Edit
npm install -g localtunnel
lt --port 8000
🖼 Project Structure
bash
Copy
Edit
MindMeld/
│
├── backend/               # Flask API & AI processing
│   ├── app.py              # Main backend app
│   ├── emotion_model.pkl   # Trained emotion detection model
│   ├── requirements.txt    # Dependencies
│
├── frontend/               # Web interface
│   ├── index.html          # Main chat UI
│   ├── styles.css          # Styling
│   ├── script.js           # Client-side logic
│
├── .env                    # API keys and secrets
└── README.md               # Project documentation
🧪 Example Usage
User: "I feel really anxious about my exams."
MindMeld: "It sounds like you’re feeling stressed about upcoming challenges. Let’s try breaking this down into smaller, more manageable steps. What’s the first thing you can do right now to feel more in control?"

⚠ Important Notes
This is not a substitute for professional therapy. MindMeld is a supportive tool, not a certified mental health provider.

API usage may be subject to Gemini API daily quotas (free tier = 50 requests/day).

Keep your .env file private to avoid exposing API keys.

📜 License
This project is licensed under the MIT License – see the LICENSE file for details.

💡 Future Plans
🌐 Deployment to Vercel/Render

🎨 Premium UI redesign

🔊 Full voice conversation mode

📊 Mood tracking dashboard

📱 Mobile-friendly interface

