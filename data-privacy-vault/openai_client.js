const axios = require('axios');

class OpenAIClient {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = 'https://api.openai.com/v1';
    }

    async chatCompletion(prompt, options = {}) {
        const defaultOptions = {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 150,
            temperature: 0.7,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        };

        const params = { ...defaultOptions, ...options };

        try {
            const response = await axios.post(`${this.baseURL}/chat/completions`, params, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });

            return response.data.choices[0].message.content.trim();
        } catch (error) {
            console.error('Error en la solicitud a OpenAI:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
}

module.exports = OpenAIClient;
