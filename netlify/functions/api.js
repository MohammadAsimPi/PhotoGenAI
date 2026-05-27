import serverless from 'serverless-http';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import * as nvidia from '../../src/nvidia.js';

dotenv.config();

const app = express();

// Security and Middleware
app.use(helmet({
    contentSecurityPolicy: false, // Netlify handles headers well, but we can keep some
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));

// API Routes (mirrored from server.js)
const router = express.Router();

router.post('/generate', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt is required' });
        const result = await nvidia.generateImage(prompt);
        res.json(result);
    } catch (err) {
        res.status(err.response?.status || 500).json({ error: err.message });
    }
});

router.post('/swap', async (req, res) => {
    try {
        const { image1, prompt } = req.body;
        if (!image1) return res.status(400).json({ error: 'Source image is required' });
        const result = await nvidia.analyzeImage(image1, prompt);
        res.json(result);
    } catch (err) {
        res.status(err.response?.status || 500).json({ error: err.message });
    }
});

router.get('/health', (req, res) => {
    res.json({ status: 'ok', environment: 'netlify-functions' });
});

app.use('/.netlify/functions/api', router);
app.use('/api', router); // Local and redirect compatibility

export const handler = serverless(app);
