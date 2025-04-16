import logging
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from src.functions.get_response import get_response, init_model_resources

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.FileHandler("app.log"), logging.StreamHandler()],
)

# Create Flask app
app = Flask(__name__)
# Set the API key for internal validation (this should match what you sent from the backend)
MEDDY_AUTH_API_KEY = os.getenv("MEDDY_AUTH_API_KEY")  # This should be set in the Flask .env file

@app.before_request
def check_api_key():
    # Extract API Key from the Authorization header
    auth_header = request.headers.get("Authorization")
    if auth_header != f"Bearer {MEDDY_AUTH_API_KEY}":
        return jsonify({"error": "Unauthorized"}), 403  # Unauthorized if keys don't match


ENV = os.getenv("FLASK_ENV", "production")


# CORS only for frontend
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "https://auth.localhost")
CORS(app, origins=[FRONTEND_ORIGIN])

# Preload models, embeddings, retriever, etc.
model_resources = init_model_resources()

# Health check
@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "OK"}), 200

# Ask GPT
@app.route("/ask", methods=["POST"])
def chat():
    try:
        # Optional: check API key header
        expected_key = os.getenv("API_KEY")
        if expected_key and request.headers.get("Authorization") != f"Bearer {expected_key}":
            return jsonify({"error": "Unauthorized"}), 401

        data = request.get_json()
        question = data.get("message", "").strip()
        user_id = data.get("user_id", "")

        if not question:
            return jsonify({"error": "Question cannot be empty."}), 400

        response = get_response(question, model_resources)

        if "error" in response:
            logging.error(f"❌ Error from get_response: {response['error']}")
            return jsonify({"error": response["error"]}), 500

        reply = response.get("result", "")
        return jsonify({"reply": reply})

    except Exception:
        logging.exception("💥 Unexpected error occurred.")
        return jsonify({"error": "Internal Server Error"}), 500
