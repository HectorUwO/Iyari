from flask import Blueprint, request, jsonify
import requests
import json

chat_bp = Blueprint('chat_api', __name__)

# Ollama API configuration
OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "mistral:7b"

@chat_bp.route('/api/chat', methods=['POST', 'OPTIONS'])
def api_chat():
    """API endpoint for chatbot"""
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response
    
    try:
        data = request.get_json()
        user_message = data.get('message', '').strip()
        history = data.get('history', [])
        is_regenerate = data.get('regenerate', False)
        
        if not user_message:
            return jsonify({
                'response': 'Por favor, escribe un mensaje.',
                'status': 'error'
            })
        
        # Generate response based on user message and history
        bot_response = generate_response(user_message, history, is_regenerate)
        
        response = jsonify({
            'response': bot_response,
            'status': 'success'
        })
        
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        
        return response
        
    except Exception as e:
        print(f"Error in api_chat: {str(e)}")
        return jsonify({
            'response': 'Lo siento, ocurrió un error interno.',
            'status': 'error'
        }), 500

def generate_response(message, history=None, is_regenerate=False):
    """Generate contextual response using Ollama Mistral 7B model"""
    try:
        # Create context-aware prompt for UAN assistant
        system_prompt = """Eres Iyari, un asistente virtual de la Universidad Autónoma de Nayarit (UAN). 
        Tu función es ayudar a estudiantes y personas interesadas con información sobre:
        - Horarios de atención
        - Inscripciones y requisitos
        - Becas y apoyos financieros
        - Carreras y programas académicos
        - Información general de la universidad
        
        Responde de manera amigable, profesional y en español. Mantén las respuestas concisas pero informativas."""
        
        # Build conversation context if history is provided
        conversation_context = ""
        if history and len(history) > 0:
            conversation_context = "\n\nContexto de la conversación:\n"
            for msg in history[-5:]:  # Only use last 5 messages for context
                role = "Usuario" if msg.get('role') == 'user' else "Iyari"
                conversation_context += f"{role}: {msg.get('content', '')}\n"
        
        regenerate_note = "\n\nGenera una respuesta diferente y mejorada." if is_regenerate else ""
        
        full_prompt = f"{system_prompt}{conversation_context}\n\nPregunta actual del usuario: {message}{regenerate_note}\nRespuesta:"
        
        # Call Ollama API
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL_NAME,
                "prompt": full_prompt,
                "stream": False,
                "options": {
                    "temperature": 0.8 if is_regenerate else 0.7,
                    "max_tokens": 300,
                    "top_p": 0.9
                }
            },
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            return result.get('response', 'Lo siento, no pude generar una respuesta.')
        else:
            return 'Lo siento, el servicio no está disponible en este momento.'
            
    except requests.RequestException as e:
        print(f"Request error: {str(e)}")
        return 'Lo siento, no pude conectar con el servicio de chat.'
    except Exception as e:
        print(f"General error: {str(e)}")
        return 'Lo siento, ocurrió un error al procesar tu consulta.'

@chat_bp.route('/api/rate-response', methods=['POST'])
def rate_response():
    """API endpoint for rating responses"""
    try:
        data = request.get_json()
        message_id = data.get('messageId')
        rating = data.get('rating')
        
        # Here you would typically save the rating to a database
        # For now, we'll just log it
        print(f"Message {message_id} rated as: {rating}")
        
        return jsonify({
            'status': 'success',
            'message': 'Rating saved successfully'
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': 'Error saving rating'
        }), 500
