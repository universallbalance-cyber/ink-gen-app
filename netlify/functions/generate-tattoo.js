exports.handler = async function(event, context) {
    // REMOVED THE 405 CHECK TO PREVENT THE ERROR
    try {
        const body = JSON.parse(event.body || "{}");
        const { prompt, image } = body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!prompt) {
            return { statusCode: 400, body: JSON.stringify({ error: "Missing prompt" }) };
        }

        let url, requestBody;

        if (image) {
            url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;
            requestBody = {
                contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: "image/png", data: image } }] }]
            };
        } else {
            url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;
            requestBody = {
                instances: [{ prompt: prompt }],
                parameters: { sampleCount: 1 }
            };
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        
        // Handle Google errors
        if (data.error) {
            return { statusCode: 200, body: JSON.stringify({ error: data.error.message }) };
        }

        const outputImage = image 
            ? data.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data
            : data.predictions?.[0]?.bytesBase64Encoded;

        return {
            statusCode: 200,
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*", // Added for safety
                "Access-Control-Allow-Methods": "POST"
            },
            body: JSON.stringify({ image: outputImage })
        };
    } catch (err) {
        return { statusCode: 200, body: JSON.stringify({ error: err.message }) };
    }
};