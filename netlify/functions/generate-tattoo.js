const fetch = require('node-fetch');

exports.handler = async (event) => {
    // 1. Get the prompt and style from your index.html
    const { prompt, style } = JSON.parse(event.body);
    
    // 2. Grab the API Key from the Netlify "Vault" we set up yesterday
    const apiKey = process.env.GOOGLE_API_KEY;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`;

    // 3. This is the "Google Paperwork" you were worried about
    // We do it here so it's hidden from the public!
    const googlePayload = {
        instances: [
            { 
                prompt: `Professional clean tattoo stencil line art: ${prompt}. ${style}. Pure white background (#FFFFFF). High resolution line art.` 
            }
        ],
        parameters: {
            sampleCount: 1,
            aspectRatio: "1:1"
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(googlePayload)
        });

        const data = await response.json();
        console.log("GOOGLE_RAW_RESPONSE:", JSON.stringify(data));
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
    } catch (error) {
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: 'Failed to communicate with Google' }) 
        };
    }
};
