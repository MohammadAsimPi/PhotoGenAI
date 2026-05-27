let sourceImage = null;

const file1 = document.getElementById('file1');
const box1 = document.getElementById('box1');
const promptInput = document.getElementById('promptInput');
const generateBtn = document.getElementById('generateBtn');
const errorMsg = document.getElementById('errorMsg');
const resultSection = document.getElementById('resultSection');
const resultText = document.getElementById('resultText');
const logEl = document.getElementById('log');

const BACKEND_URL = (window.location && window.location.origin)
    ? window.location.origin
    : 'http://localhost:3000';
// Fallback for cases where the page is opened outside the backend context.
const EFFECTIVE_BACKEND_URL = BACKEND_URL || 'http://localhost:3000';


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

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function compressImage(base64, maxWidth = 1024, quality = 0.7) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let w = img.width, h = img.height;
            if (w > maxWidth) { h = (h * maxWidth) / w; w = maxWidth; }
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = base64;
    });
}

async function handleFile(file, box) {
    if (!file) return;
    log(`Reading image...`);
    let base64 = await fileToBase64(file);
    
    log(`Compressing image...`);
    base64 = await compressImage(base64, 1024, 0.7);

    sourceImage = base64;
    box.innerHTML = `<img src="${base64}" alt="Preview">`;
    box.classList.add('has-image');
    log(`Image ready (${Math.round(base64.length/1024)}KB)`, 'success');
    updateButton();
}

file1.addEventListener('change', (e) => handleFile(e.target.files[0], box1));

function updateButton() {
    generateBtn.disabled = !sourceImage;
}

async function generateDescription() {
    const prompt = promptInput.value.trim();
    generateBtn.classList.add('loading');
    generateBtn.disabled = true;
    resultSection.classList.remove('active');
    log('Starting Image-to-Text Analysis...');

    try {
        const response = await fetch(`${EFFECTIVE_BACKEND_URL}/api/swap`, {

            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image1: sourceImage,
                prompt: prompt
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to analyze image');
        }

        if (data.choices && data.choices[0] && data.choices[0].message.content) {
            resultText.textContent = data.choices[0].message.content;
            resultSection.classList.add('active');
            log('Analysis complete!', 'success');
        } else {
            throw new Error('No analysis data in response');
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

generateBtn.addEventListener('click', generateDescription);
log('Image to Text Ready.');
