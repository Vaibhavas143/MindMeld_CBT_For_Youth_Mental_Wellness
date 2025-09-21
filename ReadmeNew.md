<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Overview of What This Program Does

This project is a simple web-based chat application that connects a browser UI to a backend service, which then calls Google’s Gemini API to generate AI responses. It also includes optional Text-to-Speech (TTS) for bot replies and Speech-to-Text (voice input) for user messages.

## High-level Flow

- User types a message (or speaks via mic) in the browser.
- The frontend sends the message to the Flask backend at /chat.
- The backend forwards the prompt to Gemini (using google.generativeai).
- Gemini returns a response; the backend sends it back to the browser.
- The browser displays the reply and, if enabled, reads it aloud via TTS.


## Components and Responsibilities

### 1) Frontend (index.html + script.js)

- Chat UI elements: chat window, input box, Send button, Mic button.
- Sends user messages to the backend: POST /chat with JSON { message }.
- Displays chat messages with automatic scroll-to-bottom behavior.
- Text-to-Speech: a toggle button (🔊/🔇) controls whether bot replies are spoken aloud using SpeechSynthesis.
- Speech-to-Text: uses Web Speech API (SpeechRecognition) to capture voice, insert transcript into the input, and auto-send.
- Basic error handling: shows messages for voice support issues or network errors.

Key behaviors from script.js:

- Adds a TTS toggle button and tracks ttsEnabled state.
- speakText(text): speaks bot replies when enabled.
- appendMessage(sender, text): appends “You” or “Bot” messages and maintains scroll.
- sendMessage(message): disables Send while in-flight, calls /chat, then re-enables; displays server reply or an error.
- Voice recognition setup: starts/stops recognition, handles results/errors, updates mic button state.

Note: The provided script.js snippet appears to have some missing closing braces/brackets due to copy truncation. Ensure all functions and event listeners are properly closed in the actual file.

### 2) Backend (Flask: app.py)

- Serves the chat page at GET / using a template (index.html).
- Accepts chat messages at POST /chat:
    - Validates non-empty input.
    - Calls get_gemini_reply(user_message).
    - Returns JSON with the model’s reply or an error message.
- CORS enabled to allow cross-origin requests (useful during development).


### 3) Gemini Client (genai_client.py)

- Loads environment variables via dotenv:
    - GEMINI_API_KEY (required)
    - GEMINI_MODEL (optional, defaults to gemini-1.5-flash)
- Reads a system prompt from system_prompt.txt and prepends it to user input.
- get_gemini_reply(user_text):
    - Instantiates GenerativeModel.
    - Builds prompt as: SYSTEM_PROMPT + “User: {user_text}”
    - Calls model.generate_content(prompt).
    - Returns response.text if present; otherwise a fallback message.
    - Logs and returns a friendly error string on exceptions.


## Prerequisites and Runtime

- Environment:
    - Python with Flask, flask-cors, python-dotenv, google-generativeai.
    - A valid GEMINI_API_KEY in the environment (.env file recommended).
- Files:
    - templates/index.html (rendered by Flask).
    - system_prompt.txt (used to guide model behavior).
- Start:
    - python app.py
    - Visit the root URL to access the chat UI.


## What This App Enables

- A working AI chat experience in the browser.
- Voice input and spoken bot replies, making it hands-free.
- Easy swap/upgrade of the underlying Gemini model via env variables.
- Centralized system prompt to keep responses consistent.

If helpful, I can review index.html and system_prompt.txt for completeness, and point out any needed fixes in script.js (like ensuring all function braces/blocks are properly closed).
<span style="display:none">[^1][^2][^3][^4]</span>

<div style="text-align: center">⁂</div>

[^1]: script.js

[^2]: app.py

[^3]: genai_client.py

[^4]: index.html

