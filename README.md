# Photo Generation AI — NVIDIA Powered Image Generation & Analysis

A production-ready web application for generating images from text and analyzing images using multimodal AI, powered by **NVIDIA's NIM (NVIDIA Inference Microservices)**.

![Photo Generation AI Interface](https://img.icons8.com/fluency/512/artificial-intelligence.png)

## 🚀 Features

- **Text-to-Image**: High-speed image generation using `Flux.1-schnell`.
- **Image-to-Text**: Detailed multimodal image analysis using `Qwen 3.5`.
- **Production-Ready Backend**: Built with Express.js, featuring:
  - Security headers via **Helmet**.
  - Request rate limiting to prevent abuse.
  - Gzip compression for fast asset delivery.
  - Environment-based configuration.
- **Modern UI**: Dark-themed, responsive design with interactive feedback and logging.

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, and JavaScript (ES6+).
- **Backend**: Node.js, Express.js.
- **AI Integration**: Axios for NVIDIA NIM API calls.
- **DevOps**: Dotenv, Morgan, Compression.

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/photo-generation-ai.git
   cd photo-generation-ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your NVIDIA API key:
   ```env
   NVIDIA_API_KEY=your_nvapi_key_here
   PORT=3000
   NODE_ENV=production
   ```
   *(Get your key at [ai.nvidia.com](https://ai.nvidia.com/))*

## 🚀 Running the App

### Development Mode
Runs with `morgan` dev logging and no-cache headers:
```bash
npm run dev
```

### Production Mode
Runs with optimized security, compression, and caching:
```bash
npm run prod
```

The app will be available at `http://localhost:3000`.

## 📂 Project Structure

- `public/`: Frontend assets (HTML, CSS, JS, manifest).
- `src/`: Backend logic and API integrations.
- `server.js`: Express server configuration.
- `.env`: (Ignored) Environment secrets.
- `.gitignore`: Standard Node.js ignore rules.

## 🔒 Security

- Hardcoded API keys are avoided; always use `.env`.
- Rate limiting is active on all `/api/` endpoints.
- Security headers are enforced via `helmet`.

## 📄 License

This project is licensed under the ISC License.
