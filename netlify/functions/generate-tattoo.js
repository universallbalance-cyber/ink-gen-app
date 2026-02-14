const fetch = require('node-fetch');

exports.handler = async (event) => {
    const { prompt, image } = JSON.parse(event.body);
    const apiKey = process.env.GEMINI_API_KEY;
    
    // Switch models based on whether we are 'Saturating' (image provided) or 'Generating' (no image)
    const model = image ? "gemini-2.5-flash-image" : "imagen-4.0-generate-001";
    
    // The URL changes depending on the model used
    const url = image 
        ? `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
        : `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${apiKey}`;

    try {
        let body;
        if (image) {
            // Format for Gemini 2.5 Flash (Saturate)
            body = {
                contents: [{
                    parts: [
                        { text: prompt },
                        { inlineData: { mimeType: "image/png", data: image } }
                    ]
                }]
            };
        } else {
            // Format for Imagen 4.0 (Initial Generate)
            body = { instances: [{ prompt }], parameters: { sampleCount: 1 } };
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        
        // Extract the image string based on which model responded
        const outputImage = image 
            ? data.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data
            : data.predictions?.[0]?.bytesBase64Encoded;

        return {
            statusCode: 200,
            body: JSON.stringify({ image: outputImage })
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
