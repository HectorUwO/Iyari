from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_cors import CORS
from api.chat import chat_bp
import os

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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)