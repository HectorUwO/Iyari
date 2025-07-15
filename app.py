from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, send_file, send_file
from flask_cors import CORS
from api.chat import chat_bp
from gtts import gTTS
from utils.document_extractor import DocumentExtractor
import os
import uuid
import tempfile

app = Flask(__name__)
app.secret_key = '1234567890'  

# Enable CORS for all routes
CORS(app)

# Register blueprints
app.register_blueprint(chat_bp)

app.template_folder = 'views'
app.static_folder = 'static'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat')
def chat():
    initial_question = request.args.get('q', '')
    return render_template('chat.html', initial_question=initial_question)

@app.route('/contacto', methods=['GET', 'POST'])
def contacto():
    if request.method == 'POST':
        nombre = request.form.get('nombre')
        email = request.form.get('email')
        telefono = request.form.get('telefono')
        asunto = request.form.get('asunto')
        mensaje = request.form.get('mensaje')
        
        flash(f'Gracias {nombre}, tu mensaje ha sido enviado. Te responderemos pronto.', 'success')
        return redirect(url_for('contacto'))
    
    return render_template('contacto.html')

@app.errorhandler(404)
def not_found(error):
    return render_template('layouts/main.html'), 404

@app.errorhandler(500)
def internal_error(error):
    return render_template('layouts/main.html'), 500

@app.route('/api/text-to-speech', methods=['POST'])
def text_to_speech():
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({'status': 'error', 'message': 'No text provided'}), 400
        
        # Create audio directory if it doesn't exist
        audio_dir = os.path.join(app.static_folder, 'audio')
        os.makedirs(audio_dir, exist_ok=True)
        
        # Generate unique filename
        filename = f"speech_{uuid.uuid4().hex[:8]}.mp3"
        filepath = os.path.join(audio_dir, filename)
        
        # Generate speech using gTTS
        tts = gTTS(text=text, lang='es', slow=False)
        tts.save(filepath)
        
        # Generate URL for the audio file
        audio_url = url_for('static', filename=f'audio/{filename}')
        
        return jsonify({
            'status': 'success',
            'audioUrl': audio_url
        })
        
    except Exception as e:
        app.logger.error(f"Error in text-to-speech: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/documents', methods=['GET'])
def get_documents():
    """
    API para obtener documentos con su contenido extraído.
    Requiere header 'X-API-Key' con valor específico.
    Retorna el contenido de texto de los documentos para ser usado por el chatflow.
    """
    # Verificar header de autorización
    api_key = request.headers.get('X-API-Key')
    if api_key != 'iyari-secret-key-2025':
        return jsonify({
            'status': 'error',
            'message': 'Unauthorized: Invalid or missing API key'
        }), 401
    
    try:
        documents_dir = os.path.join('private', 'documents')
        
        # Verificar si el directorio existe
        if not os.path.exists(documents_dir):
            return jsonify({
                'status': 'error',
                'message': 'Documents directory not found'
            }), 404
        
        # Extraer contenido de todos los documentos
        documents = DocumentExtractor.extract_multiple_documents(documents_dir)
        
        # Filtrar solo documentos procesados exitosamente para el chatflow
        successful_documents = []
        failed_documents = []
        
        for doc in documents:
            if doc['success'] and doc['content']:
                # Formato esperado por Flowise/LangChain
                successful_documents.append({
                    'pageContent': doc['content'],
                    'metadata': {
                        'source': doc['metadata']['filename'],
                        'filename': doc['metadata']['filename'],
                        'extension': doc['metadata']['extension'],
                        'size': doc['metadata']['size'],
                        'word_count': doc.get('word_count', 0),
                        'char_count': doc.get('char_count', 0)
                    }
                })
            else:
                failed_documents.append({
                    'filename': doc['metadata']['filename'],
                    'error': doc['error']
                })
        
        response_data = {
            'status': 'success',
            'documents': successful_documents,
            'total_count': len(successful_documents),
            'failed_count': len(failed_documents)
        }
        
        # Incluir información de documentos fallidos si los hay
        if failed_documents:
            response_data['failed_documents'] = failed_documents
        
        return jsonify(response_data)
        
    except Exception as e:
        app.logger.error(f"Error processing documents: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Internal server error: {str(e)}'
        }), 500

@app.route('/api/documents/<filename>', methods=['GET'])
def download_document(filename):
    """
    API para descargar un documento específico.
    Requiere header 'X-API-Key' con valor específico.
    """
    # Verificar header de autorización
    api_key = request.headers.get('X-API-Key')
    if api_key != 'iyari-secret-key-2025':
        return jsonify({
            'status': 'error',
            'message': 'Unauthorized: Invalid or missing API key'
        }), 401
    
    try:
        documents_dir = os.path.join('private', 'documents')
        file_path = os.path.join(documents_dir, filename)
        
        # Verificar si el archivo existe y está dentro del directorio permitido
        if not os.path.exists(file_path) or not os.path.isfile(file_path):
            return jsonify({
                'status': 'error',
                'message': 'Document not found'
            }), 404
        
        # Verificar que el archivo esté realmente en el directorio de documentos
        # (prevenir path traversal attacks)
        real_path = os.path.realpath(file_path)
        real_documents_dir = os.path.realpath(documents_dir)
        
        if not real_path.startswith(real_documents_dir):
            return jsonify({
                'status': 'error',
                'message': 'Access denied'
            }), 403
        
        # Enviar el archivo
        return send_file(file_path, as_attachment=True)
        
    except Exception as e:
        app.logger.error(f"Error downloading document: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Internal server error'
        }), 500

@app.route('/api/documents/metadata', methods=['GET'])
def get_documents_metadata():
    """
    API para obtener solo la metadata de los documentos (sin contenido).
    Requiere header 'X-API-Key' con valor específico.
    """
    # Verificar header de autorización
    api_key = request.headers.get('X-API-Key')
    if api_key != 'iyari-secret-key-2025':
        return jsonify({
            'status': 'error',
            'message': 'Unauthorized: Invalid or missing API key'
        }), 401
    
    try:
        documents_dir = os.path.join('private', 'documents')
        
        # Verificar si el directorio existe
        if not os.path.exists(documents_dir):
            return jsonify({
                'status': 'error',
                'message': 'Documents directory not found'
            }), 404
        
        # Obtener metadata de documentos
        documents = DocumentExtractor.extract_multiple_documents(documents_dir)
        
        # Extraer solo metadata
        metadata_list = []
        for doc in documents:
            metadata_info = doc['metadata'].copy()
            metadata_info['success'] = doc['success']
            metadata_info['has_content'] = doc['success'] and bool(doc['content'])
            
            if doc['success'] and doc['content']:
                metadata_info['word_count'] = doc.get('word_count', 0)
                metadata_info['char_count'] = doc.get('char_count', 0)
            
            if not doc['success']:
                metadata_info['error'] = doc['error']
            
            metadata_list.append(metadata_info)
        
        return jsonify({
            'status': 'success',
            'documents': metadata_list,
            'total_count': len(metadata_list)
        })
        
    except Exception as e:
        app.logger.error(f"Error accessing documents metadata: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Internal server error: {str(e)}'
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)