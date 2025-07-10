# 🌟 Iyari - Tu Asistente Virtual UAN

<div align="center">
  <img src="static/img/iyari_color.png" alt="Iyari Logo" width="150" height="150">
  
  [![Flask](https://img.shields.io/badge/Flask-3.0.0-blue?style=for-the-badge&logo=flask)](https://flask.palletsprojects.com/)
  [![Python](https://img.shields.io/badge/Python-3.10+-green?style=for-the-badge&logo=python)](https://python.org)
  [![UAN](https://img.shields.io/badge/Universidad-Autónoma_de_Nayarit-orange?style=for-the-badge)](https://www.uan.edu.mx/)
</div>

## 🎓 ¿Qué es Iyari?

**Iyari** es tu compañero digital perfecto para el apoyo académico y tutorías en la **Universidad Autónoma de Nayarit**. Diseñado con amor 💝 para ayudar a estudiantes a navegar su camino universitario con confianza y éxito.

> 💡 **¿Sabías que...?** Iyari significa "corazón" en lengua huichol, reflejando nuestro compromiso de poner el corazón en cada interacción académica.

## ✨ Características Principales

🤖 **Chat Inteligente** - Conversaciones naturales para resolver tus dudas académicas  
📚 **Apoyo Tutorial** - Guía personalizada para tus materias  
🌐 **Interfaz Amigable** - Diseño moderno y fácil de usar  
📱 **Responsive** - Funciona perfectamente en cualquier dispositivo  
🚀 **Rápido y Confiable** - Respuestas instantáneas cuando las necesitas  

## 🚀 Instalación Rápida

### Prerrequisitos
- Python 3.10+ 🐍
- pip (incluido con Python)
- ¡Ganas de aprender! 📖

### Pasos de Instalación

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/iyari.git
   cd iyari
   ```

2. **Crea un entorno virtual** (recomendado)
   ```bash
   python -m venv venv
   venv\Scripts\activate  # En Windows
   # source venv/bin/activate  # En macOS/Linux
   ```

3. **Instala las dependencias**
   ```bash
   pip install -r requirements.txt
   ```

4. **¡Ejecuta Iyari!**
   ```bash
   python app.py
   ```

5. **¡Listo!** Abre tu navegador en `http://localhost:5000` 🎉

## 🎮 Uso

### Página Principal
- 🏠 **Inicio**: Bienvenida y navegación principal
- 💬 **Chat**: Inicia conversaciones con Iyari
- 📞 **Contacto**: Formulario para consultas especiales

### API Endpoints
```
GET  /           # Página principal
GET  /chat       # Interfaz de chat
POST /api/chat   # API para mensajes
GET  /contacto   # Formulario de contacto
```

## 🛠️ Estructura del Proyecto

```
📁 Iyari/
├── 🐍 app.py                 # Aplicación principal Flask
├── 📄 requirements.txt       # Dependencias Python
├── 📁 api/
│   └── 💬 chat.py            # API del chatbot
├── 📁 static/
│   ├── 🎨 css/              # Estilos
│   ├── 🖼️  img/              # Imágenes y logos
│   ├── ⚡ js/               # JavaScript
│   └── 🔤 fonts/            # Tipografías
└── 📁 views/
    ├── 🏠 index.html         # Página principal
    ├── 💬 chat.html          # Interfaz de chat
    ├── 📞 contacto.html      # Página de contacto
    └── 📁 layouts/           # Plantillas base
```

## 🎨 Tecnologías Utilizadas

- **Backend**: Flask 3.0.0 ⚡
- **Frontend**: HTML5, CSS3, JavaScript 🌐
- **Comunicación**: CORS habilitado para APIs 🔄
- **Fuentes**: Nexa (ExtraLight & Heavy) ✨
- **Iconos**: SVG optimizados 🎯

<div align="center">
  <img src="static/img/uan_logo.png" alt="UAN Logo" width="100">
  
  **Construyendo el futuro académico, una conversación a la vez** 💫
</div>

---

<div align="center">
  Hecho con ❤️ para la comunidad estudiantil de la UAN
  
  **¿Tienes preguntas?** ¡Pregúntale a Iyari! 🤖
</div>
