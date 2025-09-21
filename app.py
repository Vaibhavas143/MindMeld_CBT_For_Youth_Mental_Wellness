from flask import Flask, render_template, request, jsonify, Response, stream_with_context
from flask_cors import CORS
from genai_client import get_gemini_reply, stream_gemini_reply

app = Flask(__name__, template_folder="templates")
CORS(app)

@app.route("/")
def home():
    return render_template("index.html")

import logging

# ... (rest of the imports)

# ... (rest of the code)

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json() or {}
    user_message = (data.get("message") or "").strip()
    model = (data.get("model") or "").strip() or None
    temperature = data.get("temperature")

    if not user_message:
        return jsonify({"reply": "⚠️ Please enter a message."}), 400

    try:
        bot_reply = get_gemini_reply(user_message, model=model, temperature=temperature)
        return jsonify({"reply": bot_reply}), 200
    except Exception as e:
        logging.exception("Error in /chat route")
        return jsonify({"reply": f"⚠️ Error generating reply: {str(e)}"}), 500


@app.route("/chat-stream", methods=["POST"])
def chat_stream():
    data = request.get_json() or {}
    user_message = (data.get("message") or "").strip()
    model = (data.get("model") or "").strip() or None
    temperature = data.get("temperature")

    if not user_message:
        return Response("data: ⚠️ Please enter a message.\n\n", mimetype="text/event-stream")

    def event_stream():
        try:
            for chunk in stream_gemini_reply(user_message, model=model, temperature=temperature):
                # Send each chunk as an SSE event line: data: <text>\n\n
                yield f"data: {chunk}\n\n"
            yield "event: done\ndata: end\n\n"
        except Exception as e:
            logging.exception("Error in /chat-stream route")
            yield f"event: error\ndata: {str(e)}\n\n"

    return Response(stream_with_context(event_stream()), mimetype="text/event-stream")

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
