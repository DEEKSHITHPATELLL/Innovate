from flask import Flask, request, jsonify
import pickle
import pandas as pd
import logging
from flask_cors import CORS
import random
from dotenv import load_dotenv
import os
import google.generativeai as genai
from flask import render_template
from flask import send_from_directory
from flask import request
import PyPDF2
import pdfplumber
import pandas as pd
from flask import jsonify
import speech_recognition as sr
from pydub import AudioSegment
import subprocess
import shutil
import io
import tempfile
import subprocess


# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all domains (for development purposes, change for production)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Load the saved model, encoders, and dataset
try:
    with open('model.pkl', 'rb') as model_file:
        model = pickle.load(model_file)

    with open('label_encoder_area.pkl', 'rb') as le_area_file:
        label_encoder_area = pickle.load(le_area_file)

    with open('label_encoder_business.pkl', 'rb') as le_business_file:
        label_encoder_business = pickle.load(le_business_file)

    # Load the dataset used for training
    dataset = pd.read_csv('./data/training.csv')  # Replace with your dataset file path
    logging.info("Model, encoders, and dataset loaded successfully.")

except FileNotFoundError as e:
    logging.error(f"Error loading files: {str(e)}")
    exit()

# Load environment variables
load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model_chat = genai.GenerativeModel("gemini-pro")
chat = model_chat.start_chat(history=[])

# Predict route to make predictions
@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get input data from the request
        data = request.get_json()
        logging.info(f"Received data: {data}")

        # Extract 'Area Name' and 'Business Name'
        area_name = data['Area Name']
        business_name = data['Business Name']

        # Retrieve corresponding data from the dataset
        filtered_data = dataset[
            (dataset['Area Name'] == area_name) & 
            (dataset['Business Name'] == business_name)
        ]

        if filtered_data.empty:
            return jsonify({"error": "No matching data found for the given Area Name and Business Name."}), 404

        # Extract the corresponding values for the required features
        population = filtered_data.iloc[0]['Population']
        number_of_businesses = filtered_data.iloc[0]['Number of Businesses']
        need = filtered_data.iloc[0]['Need']

        logging.info(f"Retrieved data from dataset: Population={population}, "
                     f"Number of Businesses={number_of_businesses}, Need={need}")

        # Encode the inputs
        area_name_encoded = label_encoder_area.transform([area_name])[0]
        business_name_encoded = label_encoder_business.transform([business_name])[0]

        # Prepare input data for the model
        input_data = pd.DataFrame({
            'Area Name': [area_name_encoded],
            'Population': [population],
            'Business Name': [business_name_encoded],
            'Number of Businesses': [number_of_businesses],
            'Need': [need]
        })

        # Make the prediction
        predicted_success = model.predict(input_data)[0]
        if(predicted_success > 0 and predicted_success < 200):
            predicted_success = random.randint(1, 10)
        elif(predicted_success >= 200 and predicted_success <= 400):
            predicted_success = random.randint(10, 20)
        elif(predicted_success >= 400 and predicted_success <= 600):
            predicted_success = random.randint(20, 30)
        elif(predicted_success >= 600 and predicted_success <= 800):
            predicted_success = random.randint(30, 40)
        elif(predicted_success >= 800 and predicted_success <= 1000):
            predicted_success = random.randint(40, 50)
        elif(predicted_success >= 1000 and predicted_success <= 1200):
            predicted_success = random.randint(50, 60)
        elif(predicted_success >= 1200 and predicted_success <= 1400):
            predicted_success = random.randint(60, 70)
        elif(predicted_success >= 1600 and predicted_success <= 1800):
            predicted_success = random.randint(70, 80)
        elif(predicted_success >= 1800 and predicted_success <= 2000):
            predicted_success = random.randint(80, 90)
        elif(predicted_success >= 2000 and predicted_success <= 2200):
            predicted_success = random.randint(90, 100)
        else:
            predicted_success = random.randint(1, 5)
            
        return jsonify({"Predicted Success Rate": f"{predicted_success}%"})

    except KeyError as e:
        logging.error(f"Missing input data: {str(e)}")
        return jsonify({"error": f"Missing input data: {str(e)}"}), 400

    except Exception as e:
        logging.error(f"Error during prediction: {str(e)}")
        return jsonify({"error": f"An error occurred during prediction: {str(e)}"}), 500

# Chat functionality route
def is_related_to_entrepreneurship(question):
    keywords = [
        "startup", "business", "entrepreneur", "funding", "marketing", 
        "investment", "revenue", "scaling", "strategy", "founder", 
        "venture capital", "growth", "finance", "customers", "sales",
        "company", "market", "profit", "innovation", "product"
    ]
    return any(keyword in question.lower() for keyword in keywords)

@app.route("/chat", methods=["POST"])
def chat_with_bot():
    try:
        data = request.json
        question = data.get("message")

        if not question:
            return jsonify({"error": "No question provided"}), 400

        # Check if question is related to entrepreneurship
        if not is_related_to_entrepreneurship(question):
            return jsonify({
                "reply": "I can only answer questions related to entrepreneurship, startups, and business. Please rephrase your question to focus on these topics."
            })

        # Create entrepreneurship-specific prompt
        entrepreneurship_prompt = f"""
        You are an expert AI assistant specializing in entrepreneurship and startups.
        Focus on providing practical, actionable advice related to:
        - Starting and growing businesses
        - Business strategy and planning
        - Funding and investment
        - Marketing and sales
        - Market analysis
        - Business operations
        
        Question: {question}
        
        Provide a clear, concise, and practical answer focused on entrepreneurship.
        """
        
        # Create a new chat for each question to avoid context confusion
        chat = model_chat.start_chat(history=[])
        response = chat.send_message(entrepreneurship_prompt)
        
        return jsonify({"reply": response.text})
        
    except Exception as e:
        logging.error(f"Error in chat: {str(e)}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@app.route("/upload", methods=["POST"])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    try:
        if file.filename.endswith('.csv'):
            file_content = analyze_csv(file)
        elif file.filename.endswith('.pdf'):
            file_content = analyze_pdf(file)
        elif file.filename.endswith('.txt'):
            file_content = analyze_txt(file)
        else:
            return jsonify({"error": "Unsupported file type"}), 400
        response_chunks = get_gemini_response(f"Analyze this file content:\n{file_content}")
        response_text = "".join(response_chunks)

        return jsonify({"response": response_text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
recognizer = sr.Recognizer()

def is_ffmpeg_installed():
    return shutil.which('ffmpeg') is not None

@app.route("/voice-chat", methods=["POST"])
def voice_chat():
    try:
        if not is_ffmpeg_installed():
            logging.error("FFmpeg is not installed on the system")
            return jsonify({
                "error": "Server configuration error: FFmpeg is not installed. Please install FFmpeg to use voice chat."
            }), 500

        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400
        
        audio_file = request.files['audio']
        
        # Create temporary files for audio processing
        with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as webm_audio:
            audio_file.save(webm_audio.name)
            
            # Convert WebM to WAV using ffmpeg
            with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as wav_audio:
                try:
                    result = subprocess.run([
                        'ffmpeg', '-i', webm_audio.name,
                        '-acodec', 'pcm_s16le',
                        '-ar', '16000',
                        '-ac', '1',
                        '-y', wav_audio.name
                    ], capture_output=True, text=True)
                    
                    if result.returncode != 0:
                        logging.error(f"FFmpeg conversion failed: {result.stderr}")
                        return jsonify({
                            "error": "Failed to process audio file. Please try again."
                        }), 500

                    # Convert audio to text
                    try:
                        with sr.AudioFile(wav_audio.name) as source:
                            audio_data = recognizer.record(source)
                            text = recognizer.recognize_google(audio_data)
                            
                            if not is_related_to_entrepreneurship(text):
                                return jsonify({
                                    "original_text": text,
                                    "reply": "I can only answer questions related to entrepreneurship, startups, and business. Please rephrase your question to focus on these topics."
                                })

                            entrepreneurship_prompt = f"""
                            You are an expert AI assistant specializing in entrepreneurship and startups.
                            Focus on providing practical, actionable advice related to:
                            - Starting and growing businesses
                            - Business strategy and planning
                            - Funding and investment
                            - Marketing and sales
                            - Market analysis
                            - Business operations
                            
                            Question: {text}
                            
                            Provide a clear, concise, and practical answer focused on entrepreneurship.
                            """
                            
                            chat = model_chat.start_chat(history=[])
                            response = chat.send_message(entrepreneurship_prompt)
                            
                            return jsonify({
                                "original_text": text,
                                "reply": response.text
                            })
                            
                    except sr.UnknownValueError:
                        return jsonify({"error": "Could not understand the audio. Please speak clearly and try again."}), 400
                    except sr.RequestError as e:
                        return jsonify({"error": f"Error with the speech recognition service: {str(e)}"}), 500
                except subprocess.SubprocessError as e:
                    logging.error(f"FFmpeg subprocess error: {str(e)}")
                    return jsonify({
                        "error": "Failed to process audio file. Please try again."
                    }), 500
                
    except Exception as e:
        logging.error(f"Error in voice chat: {str(e)}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    finally:
        # Clean up temporary files
        try:
            if 'webm_audio' in locals():
                os.unlink(webm_audio.name)
            if 'wav_audio' in locals():
                os.unlink(wav_audio.name)
        except Exception as e:
            logging.error(f"Error cleaning up temporary files: {str(e)}")
@app.route('/')
def home():
    return "Flask server is running. Use the /predict endpoint to make predictions or /chat for chatting."

# Run the Flask app
if __name__ == "__main__":
    app.run(debug=True)
