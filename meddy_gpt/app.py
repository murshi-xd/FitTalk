import logging
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from src.functions.get_response import get_response

# Setup logging (console + file)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("app.log"),
        logging.StreamHandler()
    ]
)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS

logging.info("🔥 Flask app is starting...")

@app.route("/ask", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        question = data.get("message", "").strip()
        user_id = data.get("user_id", "")

        if not question:
            return jsonify({"error": "Question cannot be empty."}), 400


        response = get_response(question)

        if "error" in response:
            logging.error(f"❌ Error from get_response: {response['error']}")
            return jsonify({"error": response["error"]}), 500

        reply = response.get("result", "")

        return jsonify({"reply": reply})

    except Exception as e:
        logging.exception("💥 Unexpected error occurred.")
        return jsonify({"error": "Internal Server Error"}), 500

if __name__ == '__main__':
    # Avoid issues with Flask's reloader duplicating logs
    app.run(host="0.0.0.0", port=8080, debug=True, use_reloader=False)
    logging.info("🚀 Flask app is running... ")