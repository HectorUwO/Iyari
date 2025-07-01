from flask import Blueprint, request, jsonify

chat_bp = Blueprint('chat_api', __name__)

@chat_bp.route('/api/chat', methods=['POST', 'OPTIONS'])
def api_chat():
    """API endpoint for chatbot - returns static message for testing"""
    # Handle preflight request
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response
    
    data = request.get_json()
    user_message = data.get('message', '')
    
    # Static response for testing
    bot_response = f"Hola! Recibí tu mensaje: '{user_message}'. Soy Iyari, tu asistente virtual. ¿En qué más puedo ayudarte?"
    
    response = jsonify({
        'response': bot_response,
        'status': 'success'
    })
    
    # Add CORS headers
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    
    return response
