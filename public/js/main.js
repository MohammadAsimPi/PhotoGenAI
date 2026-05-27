const promptInput = document.getElementById('promptInput');
const generateBtn = document.getElementById('generateBtn');
const errorMsg = document.getElementById('errorMsg');
const resultSection = document.getElementById('resultSection');
const resultImage = document.getElementById('resultImage');
const downloadBtn = document.getElementById('downloadBtn');
const logEl = document.getElementById('log');

const BACKEND_URL = window.location.origin;

function log(msg, type = 'info') {
    const time = new Date().toLocaleTimeString();
    const div = document.createElement('div');
    div.innerHTML = `<span class="timestamp">[${time}]</span> <span style="color:${type === 'error' ? '#ff6b6b' : '#4fc1ff'}">${msg}</span>`;
    logEl.appendChild(div);
    logEl.scrollTop = logEl.scrollHeight;
}

function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.add('active');
    setTimeout(() => errorMsg.classList.remove('active'), 8000);
}

async function generateImage() {
    const prompt = promptInput.value.trim();
    if (!prompt) {
        showError('Please enter a prompt');
        return;
    }

    generateBtn.classList.add('loading');
    generateBtn.disabled = true;
    resultSection.classList.remove('active');
    log('Starting generation...');

    try {
        const response = await fetch(`${BACKEND_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to generate image');
        }

        // NVIDIA / artifacts[0].base64 format
        if (data.artifacts && data.artifacts[0]) {
            const artifact = data.artifacts[0];
            
            // Check for safety filters
            if (artifact.finishReason === 'CONTENT_FILTERED') {
                log('Warning: Content was filtered by NVIDIA safety filters.', 'error');
                showError('Safety Filter: The prompt or generated image was flagged by NVIDIA safety filters. Please try a more appropriate prompt.');
                return;
            }

            if (artifact.base64) {
                const b64 = artifact.base64;
                const imageUrl = `data:image/png;base64,${b64}`;
                resultImage.src = imageUrl;
                
                // Update download button
                downloadBtn.href = imageUrl;
                downloadBtn.download = `photo-ai-${Date.now()}.png`;
                
                resultSection.classList.add('active');
                log('Image generated successfully!', 'success');
            } else {
                throw new Error('No image data in response');
            }
        } else {
            throw new Error('Invalid response structure from API');
        }

    } catch (err) {
        log(`Error: ${err.message}`, 'error');
        showError(err.message);
        console.error(err);
    } finally {
        generateBtn.classList.remove('loading');
        generateBtn.disabled = false;
    }
}

generateBtn.addEventListener('click', generateImage);

log('Photo AI Ready.');
log('Model ready.');
