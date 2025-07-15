# API de Documentos Privados

Esta documentación describe las APIs para acceder a los documentos privados del sistema Iyari.

## Autenticación

Todas las APIs de documentos requieren autenticación mediante un header HTTP:

```
X-API-Key: iyari-secret-key-2025
```

## Endpoints

### 1. Obtener Lista de Documentos

**Endpoint:** `GET /api/documents`

**Headers requeridos:**
- `X-API-Key: iyari-secret-key-2025`

**Respuesta exitosa (200):**
```json
{
  "status": "success",
  "documents": [
    {
      "filename": "Intersemestral Calculo Jun2023.xlsx",
      "size": "15.2 KB",
      "size_bytes": 15542,
      "extension": ".xlsx"
    },
    {
      "filename": "Memorias de semiconductores.docx",
      "size": "8.9 KB",
      "size_bytes": 9126,
      "extension": ".docx"
    },
    {
      "filename": "Proyectos de Investigación Registrados.pdf",
      "size": "245.8 KB",
      "size_bytes": 251853,
      "extension": ".pdf"
    }
  ],
  "total_count": 3
}
```

### 2. Descargar Documento Específico

**Endpoint:** `GET /api/documents/<filename>`

**Headers requeridos:**
- `X-API-Key: iyari-secret-key-2025`

**Parámetros:**
- `filename`: Nombre del archivo a descargar

**Respuesta exitosa (200):**
El archivo se descarga directamente como attachment.

## Códigos de Error

### 401 - No Autorizado
```json
{
  "status": "error",
  "message": "Unauthorized: Invalid or missing API key"
}
```

### 404 - No Encontrado
```json
{
  "status": "error",
  "message": "Document not found"
}
```

### 403 - Acceso Denegado
```json
{
  "status": "error",
  "message": "Access denied"
}
```

### 500 - Error Interno del Servidor
```json
{
  "status": "error",
  "message": "Internal server error"
}
```

## Ejemplos de Uso

### Con cURL

**Obtener lista de documentos:**
```bash
curl -X GET "http://localhost:5000/api/documents" \
  -H "X-API-Key: iyari-secret-key-2025"
```

**Descargar documento específico:**
```bash
curl -X GET "http://localhost:5000/api/documents/Intersemestral%20Calculo%20Jun2023.xlsx" \
  -H "X-API-Key: iyari-secret-key-2025" \
  -o "documento_descargado.xlsx"
```

### Con JavaScript (fetch)

```javascript
// Obtener lista de documentos
fetch('/api/documents', {
  headers: {
    'X-API-Key': 'iyari-secret-key-2025'
  }
})
.then(response => response.json())
.then(data => console.log(data));

// Descargar documento
fetch('/api/documents/Intersemestral Calculo Jun2023.xlsx', {
  headers: {
    'X-API-Key': 'iyari-secret-key-2025'
  }
})
.then(response => response.blob())
.then(blob => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'documento.xlsx';
  a.click();
});
```

## Seguridad

- Los documentos están protegidos por autenticación mediante header API key
- Se previenen ataques de path traversal
- Solo se permite acceso a archivos dentro del directorio `private/documents`
- Se valida que el archivo existe antes de intentar descargarlo

## Notas

- La API key debe mantenerse segura y no exponerse en código del lado del cliente
- Los archivos se devuelven como attachments para forzar la descarga
- Se incluye información detallada sobre el tamaño y tipo de cada archivo