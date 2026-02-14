exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

    try {
        const { prompt, image } = JSON.parse(event.body);
        const apiKey = process.env.GEMINI_API_KEY;

        let url, requestBody;

        if (image) {
            // SATURATE: Gemini 2.5 Flash (generateContent)
            url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;
            requestBody = {
                contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: "image/png", data: image } }] }]
            };
        } else {
            // GENERATE: Imagen 4.0 (predict)
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
        if (data.error) return { statusCode: 400, body: JSON.stringify({ error: data.error.message }) };

        const outputImage = image 
            ? data.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data
            : data.predictions?.[0]?.bytesBase64Encoded;

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: outputImage })
        };
    } catch (err) {
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
};