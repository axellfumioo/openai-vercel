const express = require("express");
const OpenAI = require("openai");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables from a .env file

const app = express();

// Initialize OpenAI with your API key
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Store your OpenAI API key in .env file
});

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Authorization middleware
app.use((req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${process.env.AUTH_TOKEN}`) {
        return res.status(403).json({ error: "Unauthorized access" });
    }
    next();
});

// API endpoint
app.post("/analyze-image", async (req, res) => {
    try {
        const { imageUrl } = req.body;

        if (!imageUrl) {
            return res.status(400).json({ error: "Missing imageUrl in the request body" });
        }

        // Send request to OpenAI
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    "role": "system",
                    "content": [
                        {
                            "type": "text",
                            "text": "aww"
                        }
                    ]
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "What's in this image?" },
                        {
                            type: "image_url",
                            image_url: {
                                url: imageUrl,
                            },
                        },
                    ],
                },
            ],
        });

        // Extract the response from OpenAI
        const openAiResponse = response.choices[0].message.content;

        // Send the result back to the client
        res.status(200).json({ result: openAiResponse });
    } catch (error) {
        console.error("Error communicating with OpenAI:", error);
        res.status(500).json({ error: "An error occurred while processing the request" });
    }
});

module.exports = app;