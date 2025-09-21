// DOM Elements
const chatWindow = document.getElementById("chatWindow");
const chatInput = document.getElementById("chatInput");
const sendButton = document.getElementById("sendButton");
const micButton = document.getElementById("micButton");
const ttsToggle = document.getElementById("ttsToggle");
const langSelect = document.getElementById("langSelect");
const rateRange = document.getElementById("rateRange");
const pitchRange = document.getElementById("pitchRange");

let isSending = false;
let ttsEnabled = true;

// Persist minimal TTS settings
(function loadPrefs() {
  try {
    const s = JSON.parse(localStorage.getItem("prefs") || "{}");
    if (typeof s.ttsEnabled === "boolean") {
      ttsEnabled = s.ttsEnabled;
      ttsToggle.textContent = ttsEnabled ? "🔊" : "🔇";
    }
    if (s.lang) langSelect.value = s.lang;
    if (typeof s.rate === "number") rateRange.value = s.rate;
    if (typeof s.pitch === "number") pitchRange.value = s.pitch;
  } catch {}
})();

function savePrefs() {
  const s = {
    ttsEnabled,
    lang: langSelect.value,
    rate: Number(rateRange.value),
    pitch: Number(pitchRange.value),
  };
  localStorage.setItem("prefs", JSON.stringify(s));
}

// Toggle TTS
ttsToggle.addEventListener("click", () => {
  ttsEnabled = !ttsEnabled;
  ttsToggle.textContent = ttsEnabled ? "🔊" : "🔇";
  savePrefs();
});
[langSelect, rateRange, pitchRange].forEach(el => el.addEventListener("change", savePrefs));

// Speech Synthesis (TTS)
function speakText(text) {
  if (!ttsEnabled || !window.speechSynthesis) return;
  try { window.speechSynthesis.cancel(); } catch {}
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = langSelect.value || "en-US";
  utterance.rate = Number(rateRange.value) || 1;
  utterance.pitch = Number(pitchRange.value) || 1;
  window.speechSynthesis.speak(utterance);
}

// Utilities
function atBottom() {
  return chatWindow.scrollHeight - chatWindow.clientHeight <= chatWindow.scrollTop + 10;
}
function scrollToBottomIfNeeded() {
  if (atBottom()) chatWindow.scrollTop = chatWindow.scrollHeight;
}
function timestamp() {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function escapeHtml(str) {
  return (str || "").replace(/[&<>"']/g, s => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[s]));
}

// Message rendering
function makeMessageRow(sender, text) {
  const row = document.createElement("div");
  row.className = `msg ${sender === "You" ? "user-message" : "bot-message"}`;

  const avatar = document.createElement("div");
  avatar.className = `avatar ${sender === "You" ? "user" : "bot"}`;
  avatar.textContent = sender === "You" ? "🧑" : "🤖";

  const col = document.createElement("div");

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = `${text}`;

  const rowEnd = document.createElement("div");
  rowEnd.className = "row-end";

  const time = document.createElement("span");
  time.textContent = timestamp();

  const copyBtn = document.createElement("button");
  copyBtn.className = "copy-btn";
  copyBtn.textContent = "Copy";
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = "Copied!";
      setTimeout(() => (copyBtn.textContent = "Copy"), 900);
    } catch {}
  });

  rowEnd.appendChild(time);
  rowEnd.appendChild(copyBtn);
  col.appendChild(bubble);
  col.appendChild(rowEnd);
  row.appendChild(avatar);
  row.appendChild(col);
  return { row, bubble };
}

function appendMessage(sender, text) {
  const wasBottom = atBottom();
  const { row } = makeMessageRow(sender, text);
  chatWindow.appendChild(row);
  if (wasBottom) scrollToBottomIfNeeded();
  if (sender === "Bot") speakText(text);
}

function appendBotThinking() {
  const { row, bubble } = makeMessageRow("Bot", "Thinking…");
  bubble.textContent = "Thinking…";
  bubble.style.opacity = "0.85";
  chatWindow.appendChild(row);
  scrollToBottomIfNeeded();
  return bubble; // we will replace this once reply arrives
}

function replaceBubbleText(bubbleEl, newText) {
  bubbleEl.textContent = newText;
  scrollToBottomIfNeeded();
}

// Send message to backend (existing /chat endpoint)
async function sendMessage(message) {
  if (isSending || !message.trim()) return;
  isSending = true;
  sendButton.disabled = true;

  appendMessage("You", message);
  chatInput.value = "";
  chatInput.focus();

  // Show placeholder
  const botBubble = appendBotThinking();

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    const reply = data.reply || "🤖 No response received.";
    replaceBubbleText(botBubble, reply);
    speakText(reply);
  } catch (err) {
    console.error("Fetch error:", err);
    replaceBubbleText(botBubble, "⚠️ Error contacting server.");
  } finally {
    isSending = false;
    sendButton.disabled = false;
  }
}

// Events for send
sendButton.addEventListener("click", () => sendMessage(chatInput.value));
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage(chatInput.value);
  }
});

// Voice typing (SpeechRecognition)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
  // Hide mic if unsupported and inform user
  if (micButton) micButton.style.display = "none";
  appendMessage("Bot", "🎤 Voice typing not supported in this browser.");
} else {
  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  micButton.addEventListener("click", () => {
    // Set recognition language from selector if present
    recognition.lang = (langSelect && langSelect.value) ? langSelect.value : "en-US";
    try {
      recognition.start();
      micButton.textContent = "🎙️ Listening...";
      micButton.disabled = true;
    } catch (e) {
      console.error("Recognition start error:", e);
    }
  });

  recognition.addEventListener("result", (event) => {
    const transcript = event.results[0][0].transcript;
    chatInput.value = transcript;
    sendMessage(transcript);
  });

  recognition.addEventListener("end", () => {
    micButton.textContent = "🎤";
    micButton.disabled = false;
  });

  recognition.addEventListener("error", (event) => {
    console.error("Voice recognition error:", event.error);
    appendMessage("Bot", `⚠️ Voice recognition error: ${event.error}`);
    micButton.textContent = "🎤";
    micButton.disabled = false;
  });
}

// Welcome message (optional)
if (!sessionStorage.getItem("welcomed")) {
  appendMessage("Bot", "Welcome! Voice typing is ready 1.) Please Click 🎤 to speak, & I’ll respond. 2.) Toggle TTS with 🔊.");
  sessionStorage.setItem("welcomed", "1");
}
