const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('node:crypto');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = 3001;

// Usar raw bodyParser para capturar el cuerpo de la solicitud como un buffer
app.use(bodyParser.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error conectando a MongoDB:', err));

const Token = require('./models/Token');

const OpenAIClient = require('./openai_client');
require('dotenv').config();

const openai = new OpenAIClient(process.env.OPENAI_API_KEY);

async function generateToken(text, prefix) {
    const token = `${prefix}_${crypto.createHash('md5').update(text).digest('hex').substr(0, 12)}`;
    console.log(`Generando token para ${prefix}:`, text, '->', token);
    try {
        await Token.findOneAndUpdate(
            { originalValue: text, type: prefix },
            { token, originalValue: text, type: prefix },
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error('Error al generar token:', error);
        throw error;
    }
    return token;
}

async function anonymizeText(text) {
    const tokenMap = new Map();
    const promises = [];

    console.log('Texto original:', text);

    // Función auxiliar para reemplazar y almacenar promesas
    const replaceAndStore = async (regex, prefix) => {
        const matches = text.match(regex) || [];
        for (const match of matches) {
            if (!tokenMap.has(match)) {
                const token = await generateToken(match, prefix);
                tokenMap.set(match, token);
            }
        }
    };

    // Reemplazar nombres, emails y teléfonos
    promises.push(replaceAndStore(nameRegex, 'NAME'));
    promises.push(replaceAndStore(emailRegex, 'EMAIL'));
    promises.push(replaceAndStore(phoneRegex, 'PHONE'));

    // Esperar a que todas las promesas se resuelvan
    await Promise.all(promises);

    // Reemplazar los valores reales en el texto
    for (const [original, token] of tokenMap) {
        text = text.replace(new RegExp(original, 'g'), token);
    }

    console.log('Texto anonimizado:', text);

    return { anonymizedText: text, tokenMap };
}

async function deanonymizeText(anonymizedText) {
    console.log('Texto anonimizado recibido:', anonymizedText);
    try {
        const tokens = await Token.find();
        console.log('Tokens encontrados:', tokens);
        let deanonymizedText = anonymizedText;
        for (const { token, originalValue } of tokens) {
            console.log(`Reemplazando ${token} con ${originalValue}`);
            deanonymizedText = deanonymizedText.replace(new RegExp(token, 'g'), originalValue);
        }
        console.log('Texto desanonimizado:', deanonymizedText);
        return deanonymizedText;
    } catch (error) {
        console.error('Error en deanonymizeText:', error);
        throw error;
    }
}

app.post('/anonymize', async (req, res) => {
    console.log('Cuerpo de la solicitud recibido:', req.body);
    let message;
    
    // Función para limpiar la cadena de caracteres ilegibles
    function limpiarCadena(cadena) {
        return cadena.replace(/[^\x20-\x7E]/g, '');
    }

    try {
        if (Buffer.isBuffer(req.body)) {
            const parsedBody = JSON.parse(req.body.toString());
            message = parsedBody.message;
        } else {
            message = req.body.message;
        }

        // Limpiar el mensaje de caracteres ilegibles
        message = limpiarCadena(message);

        if (!message) {
            return res.status(400).json({ error: 'Se requiere un mensaje' });
        }

        const { anonymizedText } = await anonymizeText(message);
        res.json({ anonymizedMessage: anonymizedText });
    } catch (error) {
        console.error('Error al anonimizar:', error);
        res.status(500).json({ error: 'Error al anonimizar el mensaje', details: error.message });
    }
});

app.post('/deanonymize', async (req, res) => {
    console.log('Cuerpo de la solicitud recibido:', req.body.toString());
    let anonymizedMessage;

    // Función para limpiar la cadena de caracteres ilegibles
    function limpiarCadena(cadena) {
        return cadena.replace(/[^\x20-\x7E]/g, '');
    }

    try {
        let bodyString;
        if (Buffer.isBuffer(req.body)) {
            bodyString = req.body.toString();
        } else {
            bodyString = JSON.stringify(req.body);
        }

        // Limpiar la cadena de caracteres ilegibles
        bodyString = limpiarCadena(bodyString);

        const body = JSON.parse(bodyString);
        anonymizedMessage = body.anonymizedMessage;

        if (!anonymizedMessage) {
            return res.status(400).json({ error: 'Se requiere un mensaje anonimizado' });
        }

        // Limpiar el mensaje anonimizado
        anonymizedMessage = limpiarCadena(anonymizedMessage);

        const deanonymizedMessage = await deanonymizeText(anonymizedMessage);
        res.json({ message: deanonymizedMessage });
    } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        console.error('Contenido del cuerpo:', req.body.toString());
        return res.status(400).json({ 
            error: 'Error al procesar la solicitud', 
            details: error.message,
            receivedBody: limpiarCadena(req.body.toString()).substring(0, 200) // Muestra los primeros 200 caracteres limpios
        });
    }
});

app.post('/completar-texto', async (req, res) => {
    try {
        const { prompt } = req.body;
        const resultado = await openai.textCompletion(prompt, { max_tokens: 50 });
        res.json({ completion: resultado });
    } catch (error) {
        console.error("Error al realizar la completion:", error);
        res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
});

app.post('/secureChatGPT', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Se requiere un prompt' });
    }

    try {
        // Paso 1: Anonimizar el prompt
        console.log('Prompt original:', prompt);
        const { anonymizedText: anonymizedPrompt, tokenMap } = await anonymizeText(prompt);
        console.log('Prompt anonimizado:', anonymizedPrompt);

        // Paso 2: Enviar el prompt anonimizado a ChatGPT
        const chatGPTResponse = await openai.chatCompletion(anonymizedPrompt);
        console.log('Respuesta de ChatGPT (anonimizada):', chatGPTResponse);

        // Paso 3: Desanonimizar la respuesta
        const deanonymizedResponse = await deanonymizeText(chatGPTResponse);
        console.log('Respuesta desanonimizada:', deanonymizedResponse);

        // Paso 4: Enviar la respuesta al cliente
        res.json({ response: deanonymizedResponse });
    } catch (error) {
        console.error('Error en secureChatGPT:', error);
        if (error.response) {
            console.error('Respuesta de error de OpenAI:', error.response.data);
        }
        
        if (error.response && error.response.status === 429) {
            return res.status(429).json({ 
                error: 'Límite de cuota de API excedido', 
                details: 'Se ha alcanzado el límite de solicitudes a la API de OpenAI. Por favor, verifica tu plan y detalles de facturación.',
                openAIError: error.response.data
            });
        }
        
        res.status(500).json({ 
            error: 'Error al procesar la solicitud', 
            details: error.message,
            openAIError: error.response ? error.response.data : null
        });
    }
});

app.use((req, res, next) => {
    console.log('Recibida solicitud:', req.method, req.url);
    console.log('Headers:', req.headers);
    console.log('Cuerpo:', req.body);
    next();
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});

const nameRegex = /[A-Z][a-z]+ [A-Z][a-z]+/g;
const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const phoneRegex = /\b\d{10}\b/g;

console.log('Expresiones regulares:');
console.log('Nombre:', nameRegex);
console.log('Email:', emailRegex);
console.log('Teléfono:', phoneRegex);