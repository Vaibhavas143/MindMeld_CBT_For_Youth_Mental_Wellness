import os
import logging
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv(override=True)

API_KEY = os.getenv("GEMINI_API_KEY")
DEFAULT_MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

if not API_KEY:
    raise EnvironmentError("GEMINI_API_KEY not found in environment variables.")

genai.configure(api_key=API_KEY)

system_prompt_path = os.path.join(os.path.dirname(__file__), "system_prompt.txt")
with open(system_prompt_path, encoding="utf-8") as f:
    SYSTEM_PROMPT = f.read()

def _build_model(model: str | None, temperature: float | None):
    model_name = model or DEFAULT_MODEL_NAME
    generation_config = {}
    if temperature is not None:
        try:
            t = float(temperature)
            if 0.0 <= t <= 2.0:
                generation_config["temperature"] = t
        except Exception:
            pass
    return genai.GenerativeModel(model_name, generation_config=generation_config or None)

def get_gemini_reply(user_text: str, model: str | None = None, temperature: float | None = None) -> str:
    try:
        gm = _build_model(model, temperature)
        prompt = f"{SYSTEM_PROMPT}\nUser: {user_text}"
        response = gm.generate_content(prompt)
        if hasattr(response, "text") and response.text:
            return response.text
        return "🤖 Sorry, the model did not generate a text reply."
    except Exception as e:
        logging.exception("Gemini API error")
        return f"⚠️ Error generating reply: {str(e)}"

def stream_gemini_reply(user_text: str, model: str | None = None, temperature: float | None = None):
    """
    Yields text chunks from streaming response.
    """
    try:
        gm = _build_model(model, temperature)
        prompt = f"{SYSTEM_PROMPT}\nUser: {user_text}"
        response_stream = gm.generate_content(prompt, stream=True)

        for chunk in response_stream:
            if hasattr(chunk, "text") and chunk.text:
                yield chunk.text
    except Exception as e:
        logging.exception("Gemini streaming API error")
        # Re-raise the exception to be handled by the calling route
        raise e
