import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as nvidia from './src/nvidia.js';

// Configuration
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

const app = express();

// Security: Helmet helps secure Express apps by setting various HTTP headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "img-src": ["'self'", "data:", "blob:"],
            "script-src": ["'self'", "'unsafe-inline'"], // Allow inline scripts if needed, but 'self' is better
        },
    },
}));

// Logging: HTTP request logger
app.use(morgan(isProd ? 'combined' : 'dev'));

// Performance: Gzip compression
app.use(compression());

// Parse JSON payloads
app.use(express.json({ limit: '10mb' })); // Support larger base64 images

// Rate Limiting: Prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api/', limiter);

// API Routes
app.post('/api/generate', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt is required' });
        
        const result = await nvidia.generateImage(prompt);
        res.json(result);
    } catch (err) {
        console.error('Generation Error:', err.message);
        res.status(err.response?.status || 500).json({ 
            error: err.message, 
            details: isProd ? undefined : err.response?.data 
        });
    }
});

app.post('/api/swap', async (req, res) => {
    try {
        const { image1, prompt } = req.body;
        if (!image1) return res.status(400).json({ error: 'Source image is required' });
        
        const result = await nvidia.analyzeImage(image1, prompt);
        res.json(result);
    } catch (err) {
        console.error('Analysis Error:', err.message);
        res.status(err.response?.status || 500).json({ 
            error: err.message, 
            details: isProd ? undefined : err.response?.data 
        });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', environment: process.env.NODE_ENV });
});

// Static Files with Cache Control
const staticOptions = {
    maxAge: isProd ? '1d' : '0',
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        }
    }
};

app.use(express.static(path.join(__dirname, 'public'), staticOptions));

// Handle extensionless routes for HTML
app.get('/swap', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'swap.html'));
});

// Fallback for 404
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`
🚀 Photo Generation AI Production Server
------------------------------
Environment: ${process.env.NODE_ENV}
Port:        ${PORT}
Security:    Helmet, Rate Limiting Active
Performance: Compression, Caching Active
------------------------------
    `);
});
