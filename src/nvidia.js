import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;

if (!NVIDIA_API_KEY) {
    console.warn('WARNING: NVIDIA_API_KEY is not set in environment variables.');
}

function log(msg) {
    const time = new Date().toISOString();
    console.log(`[${time}] [NVIDIA] ${msg}`);
}

export async function generateImage(prompt) {
    const invokeUrl = "https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell";
    
    const payload = {
        "prompt": prompt,
        "height": 1024,
        "width": 1024,
        "steps": 4,
        "seed": 0
    };

    log(`Generating image: "${prompt.substring(0, 50)}..."`);

    const response = await axios.post(invokeUrl, payload, {
        headers: {
            "Authorization": `Bearer ${NVIDIA_API_KEY}`,
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    });

    return response.data;
}

export async function analyzeImage(imageUrl, prompt) {
    const invokeUrl = "https://integrate.api.nvidia.com/v1/chat/completions";

    log(`Analyzing image with Qwen 3.5...`);

    if (!imageUrl.startsWith('data:')) {
        imageUrl = `data:image/png;base64,${imageUrl}`;
    }

    const payload = {
        "model": "qwen/qwen3.5-397b-a17b",
        "messages": [
            {
                "role": "user",
                "content": [
                    { "type": "text", "text": prompt || "Describe this image in detail." },
                    { "type": "image_url", "image_url": { "url": imageUrl } }
                ]
            }
        ],
        "max_tokens": 1024,
        "temperature": 0.2,
        "top_p": 0.7,
        "stream": false
    };

    const response = await axios.post(invokeUrl, payload, {
        headers: {
            "Authorization": `Bearer ${NVIDIA_API_KEY}`,
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    });

    return response.data;
}
