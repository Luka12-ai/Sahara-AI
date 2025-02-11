require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const port = 3001;

// CORS configuration.  Restrict in production!
const corsOptions = {
    origin: ['http://127.0.0.1:8080', 'null'], // Allow 127.0.0.1:8080 and 'null' TEMPORARILY
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.get('/', (req, res) => {
    res.send('Server is running!');
});

app.post('/api/gemini', async (req, res) => {
    console.log("Received request to /api/gemini");

    if (!GEMINI_API_KEY) {
        console.error("GEMINI_API_KEY is not set!");
        return res.status(500).json({ error: "Server configuration error: API key not set." });
    }

    try {
        const message = req.body.message;
        console.log("Message received:", message);

        // CORRECTED URL (using gemini-1.5-flash and v1 endpoint)
        const geminiApiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        console.log("Sending request to Gemini API:", geminiApiUrl);


        const response = await fetch(geminiApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    role: "user", // VERY IMPORTANT: Include the role
                    parts: [{ text: message }]
                }]
            })
        });


        console.log("Gemini API response status:", response.status);
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini API error:", response.status, errorText);
             // Return the specific error
            return res.status(response.status).json({ error: `Gemini API request failed: ${response.status} - ${errorText}` });
        }

        const data = await response.json();
        console.log("Gemini API response data:", data);

         // VERY IMPORTANT: Adapt to the actual response structure
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
             res.json(data); // Send the *entire* response object
        } else {
            console.error("Unexpected response format:", data);
            res.status(500).json({ error: "Unexpected response format from Gemini API" });
        }

    } catch (error) {
        console.error('Backend error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, (err) => {
    if (err) {
        console.error("Error starting server:", err);
        return;
    }
    console.log(`Server listening at http://localhost:${port}`);
});