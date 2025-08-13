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

## ▶️ Iniciar los servicios

Para que Iyari funcione completamente, necesitas ejecutar dos servicios en terminales diferentes:

### Terminal 1 – Iyari (Flask)
```bash
python app.py
```

### Terminal 2 – Flowise
```bash
npx flowise start
```

> 💡 **Tip**: Mantén ambas terminales abiertas mientras uses Iyari para asegurar el funcionamiento completo del sistema.

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

## 🌊 Flowise - Motor de IA

**Flowise** es la plataforma que potencia la inteligencia artificial de Iyari. Es una herramienta visual de desarrollo de flujos de trabajo de IA que permite crear aplicaciones de LLM (Large Language Models) de manera intuitiva.

### ¿Qué hace Flowise en Iyari?
- 🧠 **Procesamiento de IA**: Maneja las consultas inteligentes del chatbot
- 🔗 **Integración de APIs**: Conecta diferentes servicios de IA
- 📊 **Gestión de Flujos**: Organiza la lógica de conversación
- 🎯 **Optimización**: Mejora las respuestas basadas en el contexto universitario

### Instalación de Flowise

Si es la primera vez que usas Flowise, instálalo globalmente:

```bash
npm install -g flowise
```

### Configuración para Iyari

1. **Inicia Flowise**:
   ```bash
   npx flowise start
   ```

2. **Accede al panel**: `http://localhost:3000`

3. **Configura tu flujo**: Importa la configuración específica de Iyari para el contexto UAN

> 🚀 **Pro Tip**: Flowise se ejecuta en el puerto 3000 por defecto, mientras que Iyari usa el puerto 5000. ¡Ambos puertos deben estar libres!

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
- **IA Engine**: Flowise - Plataforma visual de LLM 🌊
- **Base de Datos**: ChromaDB para embeddings 🔍
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

