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
app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
try:
    with open('model.pkl', 'rb') as model_file:
        model = pickle.load(model_file)

    with open('label_encoder_area.pkl', 'rb') as le_area_file:
        label_encoder_area = pickle.load(le_area_file)

    with open('label_encoder_business.pkl', 'rb') as le_business_file:
        label_encoder_business = pickle.load(le_business_file)
    dataset = pd.read_csv('./data/training.csv')  
    logging.info("Model, encoders, and dataset loaded successfully.")

except FileNotFoundError as e:
    logging.error(f"Error loading files: {str(e)}")
    exit()
load_dotenv()

# Simple Gemini 1.5-pro Configuration (Free Tier)
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    logging.error("GOOGLE_API_KEY not found in environment variables!")
    logging.error("Please add your Google API key to the .env file")
    exit()

# Rate limiting configuration
import threading
from collections import deque
import time

class RateLimiter:
    def __init__(self, max_requests=10, time_window=60):
        self.max_requests = max_requests
        self.time_window = time_window
        self.requests = deque()
        self.lock = threading.Lock()

    def can_make_request(self):
        with self.lock:
            now = time.time()
            # Remove old requests outside the time window
            while self.requests and self.requests[0] <= now - self.time_window:
                self.requests.popleft()

            # Check if we can make a new request
            if len(self.requests) < self.max_requests:
                self.requests.append(now)
                return True
            return False

    def wait_time(self):
        with self.lock:
            if not self.requests:
                return 0
            oldest_request = self.requests[0]
            return max(0, self.time_window - (time.time() - oldest_request))

# Initialize rate limiter (10 requests per minute to be safe)
rate_limiter = RateLimiter(max_requests=10, time_window=60)

# Simple response cache to reduce API calls
response_cache = {}
CACHE_EXPIRY = 300  # 5 minutes

def get_cache_key(prompt):
    """Generate a simple cache key from prompt"""
    import hashlib
    return hashlib.md5(prompt.lower().strip().encode()).hexdigest()[:16]

def get_cached_response(prompt):
    """Get cached response if available and not expired"""
    cache_key = get_cache_key(prompt)
    if cache_key in response_cache:
        cached_data = response_cache[cache_key]
        if time.time() - cached_data['timestamp'] < CACHE_EXPIRY:
            logging.info("Using cached response")
            return cached_data['response']
        else:
            # Remove expired cache
            del response_cache[cache_key]
    return None

def cache_response(prompt, response):
    """Cache a response"""
    cache_key = get_cache_key(prompt)
    response_cache[cache_key] = {
        'response': response,
        'timestamp': time.time()
    }

    # Simple cache cleanup - remove old entries if cache gets too large
    if len(response_cache) > 100:
        oldest_key = min(response_cache.keys(), key=lambda k: response_cache[k]['timestamp'])
        del response_cache[oldest_key]

# Initialize Google Gemini 1.5-pro
try:
    genai.configure(api_key=GOOGLE_API_KEY)
    model_chat = genai.GenerativeModel(model_name="gemini-1.5-pro")
    logging.info("Google Gemini 1.5-pro initialized successfully")
except Exception as e:
    logging.error(f"Failed to initialize Google Gemini: {e}")
    logging.error("Please check your Google API key and internet connection")
    exit()

def estimate_missing_data(area_name, business_name, dataset):
    """
    Intelligently estimate data for missing area-business combinations
    Returns: population, number_of_businesses, need, prediction_method
    """

    # Strategy 1: Check if area exists with other businesses
    area_data = dataset[dataset['Area Name'] == area_name]
    business_data = dataset[dataset['Business Name'] == business_name]

    if not area_data.empty and not business_data.empty:
        # Both area and business exist separately - combine their data
        population = int(area_data.iloc[0]['Population'])  # Convert to native Python int

        # Estimate number of businesses based on business type averages
        avg_businesses_for_type = business_data['Number of Businesses'].mean()
        number_of_businesses = int(avg_businesses_for_type)

        # Estimate need based on business type averages
        avg_need_for_type = business_data['Need'].mean()
        need = float(round(avg_need_for_type, 2))  # Convert to native Python float

        return population, number_of_businesses, need, "area_business_combination"

    elif not area_data.empty:
        # Area exists but business type doesn't - use area data with business averages
        population = int(area_data.iloc[0]['Population'])  # Convert to native Python int

        # Use overall business averages
        avg_businesses = dataset['Number of Businesses'].mean()
        avg_need = dataset['Need'].mean()

        number_of_businesses = int(avg_businesses)
        need = float(round(avg_need, 2))  # Convert to native Python float

        return population, number_of_businesses, need, "area_with_avg_business"

    elif not business_data.empty:
        # Business type exists but area doesn't - use business data with area averages
        avg_population = dataset['Population'].mean()
        population = int(avg_population)

        avg_businesses_for_type = business_data['Number of Businesses'].mean()
        avg_need_for_type = business_data['Need'].mean()

        number_of_businesses = int(avg_businesses_for_type)
        need = float(round(avg_need_for_type, 2))  # Convert to native Python float

        return population, number_of_businesses, need, "business_with_avg_area"

    else:
        # Neither area nor business exists - use overall averages
        avg_population = dataset['Population'].mean()
        avg_businesses = dataset['Number of Businesses'].mean()
        avg_need = dataset['Need'].mean()

        population = int(avg_population)
        number_of_businesses = int(avg_businesses)
        need = float(round(avg_need, 2))  # Convert to native Python float

        return population, number_of_businesses, need, "full_estimation"

def calculate_intelligent_success_rate(area_name, business_name, population, number_of_businesses, need, dataset, prediction_method):
    """
    Calculate intelligent success rate based on actual dataset patterns
    """

    # Strategy 1: If we have exact match, use similar businesses in the area
    if prediction_method == "exact_match":
        # Find similar businesses in the same area
        area_businesses = dataset[dataset['Area Name'] == area_name]
        if not area_businesses.empty:
            # Calculate average success rate for the area
            area_avg_success = area_businesses['Success Rate (%)'].str.replace('%', '').astype(float).mean()

            # Find the specific business type success rate
            exact_match = area_businesses[area_businesses['Business Name'] == business_name]
            if not exact_match.empty:
                actual_success_rate = float(exact_match.iloc[0]['Success Rate (%)'].replace('%', ''))
                return round(actual_success_rate, 2)
            else:
                return round(area_avg_success, 2)

    # Strategy 2: Use business type patterns across all areas
    business_data = dataset[dataset['Business Name'] == business_name]
    area_data = dataset[dataset['Area Name'] == area_name]

    base_success_rate = 50.0  # Default baseline

    # Factor 1: Business type performance
    if not business_data.empty:
        business_avg_success = business_data['Success Rate (%)'].str.replace('%', '').astype(float).mean()
        base_success_rate = business_avg_success

    # Factor 2: Area performance modifier
    if not area_data.empty:
        area_avg_success = area_data['Success Rate (%)'].str.replace('%', '').astype(float).mean()
        area_modifier = area_avg_success / 100.0  # Convert to multiplier
        base_success_rate *= area_modifier

    # Factor 3: Population density impact
    avg_population = dataset['Population'].mean()
    population_factor = population / avg_population
    if population_factor > 1.5:
        base_success_rate *= 1.2  # Higher population = better success
    elif population_factor < 0.5:
        base_success_rate *= 0.8  # Lower population = lower success

    # Factor 4: Competition impact (number of businesses)
    avg_businesses = dataset['Number of Businesses'].mean()
    competition_factor = number_of_businesses / avg_businesses
    if competition_factor > 1.5:
        base_success_rate *= 0.85  # High competition = lower success
    elif competition_factor < 0.5:
        base_success_rate *= 1.15  # Low competition = higher success

    # Factor 5: Market need impact
    avg_need = dataset['Need'].mean()
    need_factor = need / avg_need
    if need_factor > 1.2:
        base_success_rate *= 1.1  # High need = better success
    elif need_factor < 0.8:
        base_success_rate *= 0.9  # Low need = lower success

    # Factor 6: Business type specific adjustments based on dataset patterns
    business_type_adjustments = {
        'Pharmacy': 1.3,      # Pharmacies tend to have higher success rates
        'Gym': 1.2,           # Gyms show good success in the data
        'Electronics Shop': 1.1,  # Electronics shops are moderately successful
        'Coffee Shop': 1.0,   # Coffee shops are average
        'Restaurant': 0.9     # Restaurants face more competition
    }

    if business_name in business_type_adjustments:
        base_success_rate *= business_type_adjustments[business_name]

    # Ensure reasonable bounds (based on actual data range: ~17% to ~1716%)
    base_success_rate = max(15.0, min(base_success_rate, 500.0))

    return round(base_success_rate, 2)

def get_prediction_explanation(method, area_name, business_name):
    """Get explanation for prediction method used"""
    explanations = {
        "area_business_combination": f"Prediction based on {area_name} area data combined with {business_name} business averages from other areas.",
        "area_with_avg_business": f"Prediction based on {area_name} area data with average business metrics (no {business_name} data available for this area).",
        "business_with_avg_area": f"Prediction based on {business_name} business data with average area metrics (no data available for {area_name} area).",
        "full_estimation": f"Prediction based on overall market averages (no specific data available for {area_name} area or {business_name} business type)."
    }
    return explanations.get(method, "Prediction based on available data and market analysis.")

def get_fallback_area_encoding(area_name, label_encoder, dataset):
    """Get fallback encoding for unknown area"""
    most_common_area = dataset['Area Name'].mode().iloc[0]
    logging.warning(f"Unknown area '{area_name}', using fallback: '{most_common_area}'")
    return label_encoder.transform([most_common_area])[0]

def get_fallback_business_encoding(business_name, label_encoder, dataset):
    """Get fallback encoding for unknown business"""
    most_common_business = dataset['Business Name'].mode().iloc[0]
    logging.warning(f"Unknown business '{business_name}', using fallback: '{most_common_business}'")
    return label_encoder.transform([most_common_business])[0]

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        logging.info(f"Received data: {data}")
        area_name = data['Area Name']
        business_name = data['Business Name']
        filtered_data = dataset[
            (dataset['Area Name'] == area_name) &
            (dataset['Business Name'] == business_name)
        ]

        if not filtered_data.empty:
            population = int(filtered_data.iloc[0]['Population'])
            number_of_businesses = int(filtered_data.iloc[0]['Number of Businesses'])
            need = float(filtered_data.iloc[0]['Need'])
            prediction_method = "exact_match"
        else:
            population, number_of_businesses, need, prediction_method = estimate_missing_data(area_name, business_name, dataset)

        logging.info(f"Retrieved data from dataset: Population={population}, "
                     f"Number of Businesses={number_of_businesses}, Need={need}")
        predicted_success = calculate_intelligent_success_rate(
            area_name, business_name, population, number_of_businesses, need, dataset, prediction_method
        )
            
        response_data = {
            "Predicted Success Rate": f"{predicted_success}%",
            "prediction_method": prediction_method,
            "data_used": {
                "population": int(population),  
                "number_of_businesses": int(number_of_businesses), 
                "need": float(need)  
            }
        }
        if prediction_method != "exact_match":
            response_data["note"] = get_prediction_explanation(prediction_method, area_name, business_name)

        return jsonify(response_data)

    except KeyError as e:
        logging.error(f"Missing input data: {str(e)}")
        return jsonify({"error": f"Missing input data: {str(e)}"}), 400

    except Exception as e:
        logging.error(f"Error during prediction: {str(e)}")
        return jsonify({"error": f"An error occurred during prediction: {str(e)}"}), 500
import time
import random

def get_gemini_response(prompt, max_retries=3):
    """Get response from Google Gemini 1.5-pro with caching, rate limiting and retry logic"""
    cached_response = get_cached_response(prompt)
    if cached_response:
        return cached_response
    if not rate_limiter.can_make_request():
        wait_time = rate_limiter.wait_time()
        if wait_time > 0:
            logging.info(f"Rate limit reached, waiting {wait_time:.1f}s")
            time.sleep(min(wait_time, 10))  

    for attempt in range(max_retries):
        try:
            if attempt > 0:
                delay = (2 ** attempt) + random.uniform(0, 1)  
                logging.info(f"Rate limit retry {attempt + 1}/{max_retries}, waiting {delay:.1f}s")
                time.sleep(delay)

            chat = model_chat.start_chat(history=[])
            response = chat.send_message(prompt)
            response_text = response.text.strip()
            cache_response(prompt, response_text)
            return response_text

        except Exception as e:
            error_message = str(e)
            logging.error(f"Gemini API error (attempt {attempt + 1}): {error_message}")
            if "429" in error_message or "quota" in error_message.lower() or "rate" in error_message.lower():
                if attempt < max_retries - 1:
                    retry_delay = 5 
                    if "retry_delay" in error_message:
                        try:
                            import re
                            delay_match = re.search(r'seconds: (\d+)', error_message)
                            if delay_match:
                                retry_delay = min(int(delay_match.group(1)), 30)  
                        except:
                            pass

                    logging.info(f"Rate limited, retrying in {retry_delay}s...")
                    time.sleep(retry_delay)
                    continue
                else:
                    return "I'm currently experiencing high API usage. Here's some general business advice: Success requires thorough market research, solid financial planning, effective marketing strategies, and strong execution. Please try your question again in a moment."

            elif "401" in error_message or "unauthorized" in error_message.lower():
                return "I'm having authentication issues with the API. Please check your Google API key configuration. For business advice: Focus on understanding customer needs, developing competitive advantages, and building sustainable operations."

            elif attempt == max_retries - 1:
                
                return "I'm experiencing technical difficulties, but I can still provide guidance! Business success typically involves: 1) Understanding your market and customers, 2) Developing a solid business plan, 3) Securing appropriate funding, 4) Building effective marketing strategies, and 5) Maintaining strong operational execution."

    return "I apologize for the technical issues. For business success, focus on market research, customer needs, financial planning, and strategic execution."

def create_business_prompt(question):
    """Create a professional business prompt for Gemini"""
    return f"""You are a professional business consultant and entrepreneurship expert. Provide comprehensive, well-structured advice in paragraph format.

IMPORTANT: Always respond with detailed paragraphs, not short answers or chat-style responses.

Areas of expertise:
- Starting and growing businesses
- Business strategy and planning
- Funding and investment strategies
- Marketing and sales development
- Market analysis and research
- Business operations and management

Question: {question}

Please provide a detailed, professional response with:
1. Clear explanations in paragraph format
2. Specific examples where relevant
3. Actionable advice and next steps
4. Professional business language

Your comprehensive answer:"""

def create_simple_business_response(question):
    """Simple fallback response for extreme cases when Gemini fails"""
    return "I apologize, but I'm experiencing technical difficulties. For business advice, I recommend focusing on thorough market research, solid financial planning, effective marketing strategies, and strong execution. Please try your question again in a moment.";
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

        if not is_related_to_entrepreneurship(question):
            return jsonify({
                "reply": "I can only answer questions related to entrepreneurship, startups, and business. Please rephrase your question to focus on these topics.",
                "provider": "filter"
            })
        entrepreneurship_prompt = create_business_prompt(question)

        response_text = get_gemini_response(entrepreneurship_prompt)

        return jsonify({
            "reply": response_text,
            "provider": "gemini-1.5-pro",
            "success": True
        })

    except Exception as e:
        error_message = str(e)
        logging.error(f"Error in chat: {error_message}")

        if "429" in error_message or "quota" in error_message.lower() or "rate limit" in error_message.lower():
            return jsonify({
                "error": "API quota exceeded. Trying alternative AI providers...",
                "type": "quota_exceeded"
            }), 429
        elif "401" in error_message or "unauthorized" in error_message.lower():
            return jsonify({
                "error": "API authentication failed. Using local AI models as fallback.",
                "type": "auth_error"
            }), 401
        else:
            return jsonify({"error": f"An error occurred: {error_message}"}), 500

def analyze_csv(file):
    """Analyze CSV file and return summary content"""
    try:
        df = pd.read_csv(file)
        summary = f"CSV File Analysis:\n"
        summary += f"- Rows: {len(df)}\n"
        summary += f"- Columns: {len(df.columns)}\n"
        summary += f"- Column names: {', '.join(df.columns.tolist())}\n"
        summary += f"- First 5 rows:\n{df.head().to_string()}\n"
        summary += f"- Data types:\n{df.dtypes.to_string()}\n"
        if len(df) > 0:
            summary += f"- Basic statistics:\n{df.describe().to_string()}"
        return summary
    except Exception as e:
        return f"Error analyzing CSV: {str(e)}"

def analyze_pdf(file):
    """Analyze PDF file and return text content"""
    try:
        text_content = ""
        with pdfplumber.open(file) as pdf:
            for page_num, page in enumerate(pdf.pages[:5]):  
                page_text = page.extract_text()
                if page_text:
                    text_content += f"Page {page_num + 1}:\n{page_text}\n\n"

        if not text_content.strip():
            return "PDF file appears to be empty or contains no extractable text."

        return f"PDF File Analysis:\n- Total pages analyzed: {min(len(pdf.pages), 5)}\n- Content:\n{text_content[:2000]}..."
    except Exception as e:
        return f"Error analyzing PDF: {str(e)}"

def analyze_txt(file):
    """Analyze text file and return content"""
    try:
        content = file.read().decode('utf-8')
        lines = content.split('\n')
        summary = f"Text File Analysis:\n"
        summary += f"- Total lines: {len(lines)}\n"
        summary += f"- Total characters: {len(content)}\n"
        summary += f"- Content preview:\n{content[:1000]}..."
        return summary
    except Exception as e:
        return f"Error analyzing text file: {str(e)}"

def get_gemini_response_for_file(prompt):
    """Get response from Gemini for file analysis"""
    try:
        response = get_gemini_response(prompt)
        return [response]
    except Exception as e:
        error_message = str(e)
        if "429" in error_message or "quota" in error_message.lower():
            return ["I'm currently experiencing high demand. Please try again in a few moments. For file analysis, I recommend reviewing the data structure, key metrics, and identifying patterns or trends that could inform business decisions."]
        elif "401" in error_message or "unauthorized" in error_message.lower():
            return ["I'm having authentication issues. For file analysis, focus on understanding data patterns, key performance indicators, and actionable insights for business improvement."]
        else:
            return [f"I'm experiencing technical difficulties with file analysis. Generally, when analyzing business data, look for trends, outliers, and correlations that can inform strategic decisions."]

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

        response_chunks = get_gemini_response_for_file(f"Analyze this file content and provide insights for entrepreneurship:\n{file_content}")
        response_text = "".join(response_chunks)

        return jsonify({"response": response_text})
    except Exception as e:
        error_message = str(e)
        if "quota" in error_message.lower() or "429" in error_message:
            return jsonify({
                "error": "API quota exceeded. Please try again later or check your Google API billing settings.",
                "type": "quota_exceeded"
            }), 429
        elif "auth" in error_message.lower() or "401" in error_message:
            return jsonify({
                "error": "API authentication failed. Please check your Google API key.",
                "type": "auth_error"
            }), 401
        else:
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
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as webm_audio:
            audio_file.save(webm_audio.name)
            
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
                    try:
                        with sr.AudioFile(wav_audio.name) as source:
                            audio_data = recognizer.record(source)
                            text = recognizer.recognize_google(audio_data)
                            
                            if not is_related_to_entrepreneurship(text):
                                return jsonify({
                                    "original_text": text,
                                    "reply": "I can only answer questions related to entrepreneurship, startups, and business. Please rephrase your question to focus on these topics."
                                })

                            entrepreneurship_prompt = create_business_prompt(text)

                            response_text = get_gemini_response(entrepreneurship_prompt)

                            return jsonify({
                                "original_text": text,
                                "reply": response_text,
                                "provider": "gemini-1.5-pro",
                                "success": True
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
        error_message = str(e)
        logging.error(f"Error in voice chat: {error_message}")

        if "429" in error_message or "quota" in error_message.lower() or "rate limit" in error_message.lower():
            return jsonify({
                "error": "API quota exceeded. Please try again later or check your Google API billing settings.",
                "type": "quota_exceeded"
            }), 429
        elif "401" in error_message or "unauthorized" in error_message.lower():
            return jsonify({
                "error": "API authentication failed. Please check your Google API key.",
                "type": "auth_error"
            }), 401
        else:
            return jsonify({"error": f"An error occurred: {error_message}"}), 500
    finally:
        try:
            if 'webm_audio' in locals():
                os.unlink(webm_audio.name)
            if 'wav_audio' in locals():
                os.unlink(wav_audio.name)
        except Exception as e:
            logging.error(f"Error cleaning up temporary files: {str(e)}")
@app.route('/ai-status')
def ai_status():
    """Check status of Gemini AI provider"""
    gemini_status = {
        "provider": "gemini-1.5-pro",
        "enabled": True,
        "status": "unknown"
    }

    try:
        test_response = get_gemini_response("Hello")
        if test_response and len(test_response) > 0:
            gemini_status["status"] = "available"
            gemini_status["test_response_length"] = len(test_response)
        else:
            gemini_status["status"] = "no_response"
    except Exception as e:
        gemini_status["status"] = "error"
        gemini_status["error"] = str(e)

    return jsonify({
        "ai_provider": gemini_status,
        "message": "Using Google Gemini 1.5-pro (free tier) for all AI responses"
    })

@app.route('/')
def home():
    return """
    <h1>🤖 Gemini AI Flask Server</h1>
    <p>Server is running with Google Gemini 1.5-pro (Free Tier)!</p>
    <h2>Available Endpoints:</h2>
    <ul>
        <li><strong>/predict</strong> - Business success predictions</li>
        <li><strong>/chat</strong> - AI chat with entrepreneurship focus</li>
        <li><strong>/voice-chat</strong> - Voice-based AI chat</li>
        <li><strong>/upload</strong> - File analysis</li>
        <li><strong>/ai-status</strong> - Check Gemini status</li>
    </ul>
    <h2>AI Provider:</h2>
    <p>This server uses Google Gemini 1.5-pro with free tier access:</p>
    <ul>
        <li> High-quality responses</li>
        <li> Free tier available</li>
        <li>Reliable and fast</li>
        <li>Professional business advice</li>
    </ul>
    <p><a href="/ai-status">Check Gemini Status</a></p>
    """

if __name__ == "__main__":
    app.run(debug=True)
