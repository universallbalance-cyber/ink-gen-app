const fetch = require('node-fetch');

exports.handler = async (event) => {
    const { prompt, image } = JSON.parse(event.body);
    const apiKey = process.env.GEMINI_API_KEY;

    try {
        let url;
        let body;

        if (image) {
            // Language for GEMINI 2.5 FLASH (Saturate)
            url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;
            body = {
                contents: [{
                    parts: [
                        { text: prompt },
                        { inlineData: { mimeType: "image/png", data: image } }
                    ]
                }]
            };
        } else {
            // Language for IMAGEN 4.0 (Generate)
            url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;
            body = {
                instances: [{ prompt: prompt }],
                parameters: { sampleCount: 1 }
            };
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        // Extract image based on which model responded
        const outputImage = image 
            ? data.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data
            : data.predictions?.[0]?.bytesBase64Encoded;

        if (!outputImage) {
            throw new Error(data.error?.message || "Google returned no image data");
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ image: outputImage })
        };

    } catch (error) {
        console.error("Function Error:", error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
