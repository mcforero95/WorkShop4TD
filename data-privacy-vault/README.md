# Data Privacy Vault

## Descripción del Proyecto

Data Privacy Vault es una aplicación de servidor que proporciona servicios de anonimización y desanonimización de datos sensibles, así como una integración segura con la API de OpenAI para generar respuestas mientras protege la información privada.

## Características principales

- Anonimización de nombres, correos electrónicos y números de teléfono en textos.
- Desanonimización de textos previamente anonimizados.
- Integración segura con ChatGPT para generar respuestas mientras se protege la información privada.

## Requisitos previos

- Node.js (versión 12 o superior)
- npm (normalmente viene con Node.js)
- MongoDB

## Instalación

1. Clona el repositorio:
   ```
   git clone https://github.com/tu-usuario/data-privacy-vault.git
   cd data-privacy-vault
   ```

2. Instala las dependencias:
   ```
   npm install
   ```

3. Crea un archivo `.env` en la raíz del proyecto y añade tu clave API de OpenAI:
   ```
   OPENAI_API_KEY=tu_clave_api_aqui
   MONGODB_URI=tu_uri_de_mongodb_aqui
   ```

4. Inicia el servidor:
   ```
   npm start
   ```

## Uso

El servidor expone los siguientes endpoints:

- POST `/anonymize`: Anonimiza un texto dado.
- POST `/deanonymize`: Desanonimiza un texto previamente anonimizado.
- POST `/secureChatGPT`: Envía un prompt a ChatGPT de forma segura, anonimizando la información sensible.

Ejemplo de uso con curl:

bash
curl -X POST http://localhost:3001/secureChatGPT \
-H "Content-Type: application/json" \
-d '{"prompt":"Mi nombre es Juan Pérez, mi email es juan@example.com y mi teléfono es 1234567890. ¿Puedes escribirme un correo formal solicitando una entrevista de trabajo?"}'


## Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue para discutir cambios mayores antes de hacer un pull request.

## Licencia

MATI - Uniandes
