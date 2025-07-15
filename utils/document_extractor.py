"""
Módulo para extraer texto de diferentes tipos de documentos.
Soporta PDF, DOCX y archivos de texto plano.
"""

import os
import PyPDF2
import pdfplumber
from docx import Document
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DocumentExtractor:
    """Clase para extraer texto de diferentes tipos de documentos."""
    
    @staticmethod
    def extract_text_from_pdf_pypdf2(file_path):
        """
        Extrae texto de un PDF usando PyPDF2.
        Método más rápido pero puede tener problemas con PDFs complejos.
        """
        try:
            text = ""
            with open(file_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                for page_num in range(len(reader.pages)):
                    page = reader.pages[page_num]
                    text += page.extract_text() + "\n"
            return text.strip()
        except Exception as e:
            logger.error(f"Error extracting text with PyPDF2 from {file_path}: {str(e)}")
            return None
    
    @staticmethod
    def extract_text_from_pdf_pdfplumber(file_path):
        """
        Extrae texto de un PDF usando pdfplumber.
        Método más preciso, especialmente para PDFs con tablas y layouts complejos.
        """
        try:
            text = ""
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            return text.strip()
        except Exception as e:
            logger.error(f"Error extracting text with pdfplumber from {file_path}: {str(e)}")
            return None
    
    @staticmethod
    def extract_text_from_docx(file_path):
        """Extrae texto de un archivo DOCX."""
        try:
            doc = Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text.strip()
        except Exception as e:
            logger.error(f"Error extracting text from DOCX {file_path}: {str(e)}")
            return None
    
    @staticmethod
    def extract_text_from_txt(file_path):
        """Extrae texto de un archivo de texto plano."""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read().strip()
        except UnicodeDecodeError:
            # Intentar con encoding latin-1 si UTF-8 falla
            try:
                with open(file_path, 'r', encoding='latin-1') as file:
                    return file.read().strip()
            except Exception as e:
                logger.error(f"Error extracting text from TXT {file_path}: {str(e)}")
                return None
        except Exception as e:
            logger.error(f"Error extracting text from TXT {file_path}: {str(e)}")
            return None
    
    @classmethod
    def extract_text(cls, file_path):
        """
        Extrae texto de un archivo basándose en su extensión.
        
        Args:
            file_path (str): Ruta al archivo
            
        Returns:
            dict: Diccionario con información del documento y su contenido
        """
        if not os.path.exists(file_path):
            return {
                'success': False,
                'error': 'File not found',
                'content': None,
                'metadata': None
            }
        
        file_extension = os.path.splitext(file_path)[1].lower()
        filename = os.path.basename(file_path)
        file_size = os.path.getsize(file_path)
        
        # Formatear tamaño del archivo
        if file_size < 1024:
            size_str = f"{file_size} bytes"
        elif file_size < 1024 * 1024:
            size_str = f"{file_size / 1024:.1f} KB"
        else:
            size_str = f"{file_size / (1024 * 1024):.1f} MB"
        
        metadata = {
            'filename': filename,
            'extension': file_extension,
            'size': size_str,
            'size_bytes': file_size,
            'path': file_path
        }
        
        text_content = None
        
        try:
            if file_extension == '.pdf':
                # Intentar primero con pdfplumber (más preciso)
                text_content = cls.extract_text_from_pdf_pdfplumber(file_path)
                
                # Si falla, intentar con PyPDF2
                if not text_content:
                    logger.info(f"pdfplumber failed for {filename}, trying PyPDF2...")
                    text_content = cls.extract_text_from_pdf_pypdf2(file_path)
                    
            elif file_extension == '.docx':
                text_content = cls.extract_text_from_docx(file_path)
                
            elif file_extension in ['.txt', '.md', '.rst']:
                text_content = cls.extract_text_from_txt(file_path)
                
            else:
                return {
                    'success': False,
                    'error': f'Unsupported file type: {file_extension}',
                    'content': None,
                    'metadata': metadata
                }
            
            if text_content:
                # Limpiar el texto
                text_content = cls.clean_text(text_content)
                
                return {
                    'success': True,
                    'error': None,
                    'content': text_content,
                    'metadata': metadata,
                    'word_count': len(text_content.split()),
                    'char_count': len(text_content)
                }
            else:
                return {
                    'success': False,
                    'error': 'Could not extract text from file',
                    'content': None,
                    'metadata': metadata
                }
                
        except Exception as e:
            logger.error(f"Unexpected error processing {file_path}: {str(e)}")
            return {
                'success': False,
                'error': f'Unexpected error: {str(e)}',
                'content': None,
                'metadata': metadata
            }
    
    @staticmethod
    def clean_text(text):
        """
        Limpia y normaliza el texto extraído.
        
        Args:
            text (str): Texto a limpiar
            
        Returns:
            str: Texto limpio
        """
        if not text:
            return ""
        
        # Remover múltiples espacios y saltos de línea
        import re
        
        # Remover caracteres de control excepto saltos de línea y tabulaciones
        text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)
        
        # Normalizar espacios en blanco
        text = re.sub(r'\s+', ' ', text)
        
        # Normalizar saltos de línea múltiples
        text = re.sub(r'\n\s*\n', '\n\n', text)
        
        return text.strip()
    
    @classmethod
    def extract_multiple_documents(cls, documents_dir):
        """
        Extrae texto de múltiples documentos en un directorio.
        
        Args:
            documents_dir (str): Ruta al directorio de documentos
            
        Returns:
            list: Lista de documentos con su contenido extraído
        """
        if not os.path.exists(documents_dir):
            return []
        
        documents = []
        supported_extensions = ['.pdf', '.docx', '.txt', '.md', '.rst']
        
        for filename in os.listdir(documents_dir):
            file_path = os.path.join(documents_dir, filename)
            
            if os.path.isfile(file_path):
                file_extension = os.path.splitext(filename)[1].lower()
                
                if file_extension in supported_extensions:
                    result = cls.extract_text(file_path)
                    documents.append(result)
                else:
                    # Agregar archivos no soportados con metadata pero sin contenido
                    file_size = os.path.getsize(file_path)
                    if file_size < 1024:
                        size_str = f"{file_size} bytes"
                    elif file_size < 1024 * 1024:
                        size_str = f"{file_size / 1024:.1f} KB"
                    else:
                        size_str = f"{file_size / (1024 * 1024):.1f} MB"
                    
                    documents.append({
                        'success': False,
                        'error': f'Unsupported file type: {file_extension}',
                        'content': None,
                        'metadata': {
                            'filename': filename,
                            'extension': file_extension,
                            'size': size_str,
                            'size_bytes': file_size,
                            'path': file_path
                        }
                    })
        
        return documents
