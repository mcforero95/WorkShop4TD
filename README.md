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
   git clone git@github.com:mcforero95/WorkShop4TD.git
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

curl -X POST http://localhost:3001/anonymize \
-H "Content-Type: application/json" \
-d '{"message":"oferta de trabajo para Mario Forero con email mforero@example.com y teléfono 1234567890"}'


curl -X POST http://localhost:3001/deanonymize \
-H "Content-Type: application/json" \
-d '{"anonymizedMessage":"oferta de trabajo para NAME_2c6cb09c8f71 con email EMAIL_2ac0b3d39712 y telefono PHONE_e807f1fcf82d"}'



## Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue para discutir cambios mayores antes de hacer un pull request.

## Licencia

MATI - Uniandes
