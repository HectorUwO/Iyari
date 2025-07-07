from flask import Blueprint, request, jsonify

chat_bp = Blueprint('chat_api', __name__)

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
        
        if not user_message:
            return jsonify({
                'response': 'Por favor, escribe un mensaje.',
                'status': 'error'
            })
        
        # Generate response based on user message
        bot_response = generate_response(user_message)
        
        response = jsonify({
            'response': bot_response,
            'status': 'success'
        })
        
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        
        return response
        
    except Exception as e:
        return jsonify({
            'response': 'Lo siento, ocurrió un error interno.',
            'status': 'error'
        })

def generate_response(message):
    """Generate contextual response based on user message"""
    message_lower = message.lower()
    
    if any(word in message_lower for word in ['hola', 'saludos', 'buenos días', 'buenas tardes']):
        return '¡Hola! Soy Iyari, tu asistente virtual de la UAN. ¿En qué puedo ayudarte hoy?'
    
    elif any(word in message_lower for word in ['horario', 'horarios', 'hora']):
        return 'Los horarios de atención de la UAN son de lunes a viernes de 8:00 am a 8:00 pm y sábados de 9:00 am a 1:00 pm. ¿Necesitas información sobre algún departamento específico?'
    
    elif any(word in message_lower for word in ['inscripción', 'inscribir', 'registro']):
        return 'Para inscribirte necesitas: certificado de estudios, CURP, identificación oficial y comprobante de pago. Las inscripciones para el próximo semestre son del 15 al 30 de julio. ¿Necesitas más detalles?'
    
    elif any(word in message_lower for word in ['beca', 'becas', 'apoyo financiero']):
        return 'La UAN ofrece Becas de Excelencia Académica, Socioeconómicas y Deportivas. Las convocatorias se publican al inicio de cada semestre. ¿Te interesa alguna en particular?'
    
    elif any(word in message_lower for word in ['carrera', 'carreras', 'programa', 'licenciatura']):
        return 'La UAN ofrece diversas carreras en áreas como Ingeniería, Ciencias Sociales, Ciencias de la Salud, y más. ¿Hay alguna área específica que te interese?'
    
    else:
        return f'Entiendo que preguntas sobre: "{message}". Para información más específica, te recomiendo contactar directamente al departamento correspondiente o visitar el sitio web oficial de la UAN. ¿Hay algo más en lo que pueda ayudarte?'
