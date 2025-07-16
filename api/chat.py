from flask import Blueprint, request, jsonify
import requests
import json
import re

chat_bp = Blueprint('chat_api', __name__)

# Flowise API configuration
FLOWISE_URL = "http://localhost:3000/api/v1/prediction/98729092-b9ec-4272-b6ee-2fa016074710"

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

def clean_response(response_text):
    """Remove thinking/think sections from the response"""
    if not response_text:
        return response_text
    
    # Remove content between <thinking> and </thinking> tags
    response_text = re.sub(r'<thinking>.*?</thinking>', '', response_text, flags=re.DOTALL | re.IGNORECASE)
    
    # Remove content between <think> and </think> tags
    response_text = re.sub(r'<think>.*?</think>', '', response_text, flags=re.DOTALL | re.IGNORECASE)
    
    # Remove lines that start with "Thinking:" or "Think:"
    response_text = re.sub(r'^(Thinking|Think):\s*.*$', '', response_text, flags=re.MULTILINE | re.IGNORECASE)
    
    # Remove content between thinking blocks (--- thinking --- to --- end thinking ---)
    response_text = re.sub(r'---\s*thinking\s*---.*?---\s*end\s*thinking\s*---', '', response_text, flags=re.DOTALL | re.IGNORECASE)
    
    # Clean up multiple newlines and extra whitespace
    response_text = re.sub(r'\n\s*\n', '\n\n', response_text)
    response_text = response_text.strip()
    
    return response_text

def generate_response(message, history=None, is_regenerate=False):
    """Generate contextual response using Flowise API"""
    try:
        # Build conversation context if history is provided
        conversation_context = ""
        if history and len(history) > 0:
            conversation_context = "\n\nContexto de la conversación:\n"
            for msg in history[-5:]:  # Only use last 5 messages for context
                role = "Usuario" if msg.get('role') == 'user' else "Iyari"
                conversation_context += f"{role}: {msg.get('content', '')}\n"
        
        regenerate_note = "\n\nGenera una respuesta diferente y mejorada." if is_regenerate else ""
        
        # Construct the full question with context
        full_question = f"""{conversation_context}
        
        Pregunta actual del usuario: {message}{regenerate_note}"""
        
        # Call Flowise API
        response = requests.post(
            FLOWISE_URL,
            json={
                "question": full_question
            },
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            # Flowise typically returns the response directly or in a 'text' field
            raw_response = result.get('text', result.get('response', str(result)))
            
            # Clean the response to remove thinking sections
            cleaned_response = clean_response(raw_response)
            
            return cleaned_response
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