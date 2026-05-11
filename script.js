/* =============================================
   AdGenius AI — Video Ad Script Edition
   Gemini Vision API Integration
   ============================================= */

// ──────────────────────────────────────────────
// STATE
// ──────────────────────────────────────────────
const state = {
  lang: 'id',
  duration: '15',
  theme: 'cinematic',
  imageBase64: null,
  imageMime: null,
  isLoading: false,
  latestData: null,
  videoTimeoutIds: []
};

// ──────────────────────────────────────────────
// DOM REFS
// ──────────────────────────────────────────────
const $ = id => document.getElementById(id);

const els = {
  langSwitch:       $('langSwitch'),
  apiKeyInput:      $('apiKeyInput'),
  toggleKey:        $('toggleKey'),
  fileInput:        $('fileInput'),
  previewImg:       $('previewImg'),
  btnChange:        $('btnChange'),
  targetInput:      $('targetInput'),
  btnGenerate:      $('btnGenerate'),
  // output
  emptyState:       $('emptyState'),
  loadingState:     $('loadingState'),
  resultState:      $('resultState'),
  resultDuration:   $('resultDuration'),
  resultStyle:      $('resultStyle'),
  productName:      $('productName'),
  headlineText:     $('headlineText'),
  ctaText:          $('ctaText'),
  captionText:      $('captionText'),
  storyboardContainer: $('storyboardContainer'),
  btnRegenerate:    $('btnRegenerate'),
  btnCopyAll:       $('btnCopyAll'),
  toast:            $('toast'),
  toastMsg:         $('toastMsg'),
  // video
  btnPlayVideo:     $('btnPlayVideo'),
  videoBgImage:     $('videoBgImage'),
  videoHeadlineText:$('videoHeadlineText'),
  videoSubtitleText:$('videoSubtitleText'),
  videoProgressBar: $('videoProgressBar'),
};

// ──────────────────────────────────────────────
// API KEY TOGGLE & INIT
// ──────────────────────────────────────────────
els.apiKeyInput.value = ''; // Masukkan Groq API Key di web saat digunakan

els.toggleKey.addEventListener('click', () => {
  const isPassword = els.apiKeyInput.type === 'password';
  els.apiKeyInput.type = isPassword ? 'text' : 'password';
});

// ──────────────────────────────────────────────
// OPTIONS (DURATION & THEME)
// ──────────────────────────────────────────────
document.getElementById('durationGroup').addEventListener('click', e => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  document.querySelectorAll('#durationGroup .chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  state.duration = chip.dataset.value;
});

document.getElementById('styleGroup').addEventListener('click', e => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  document.querySelectorAll('#styleGroup .chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  state.theme = chip.dataset.value;
});

// ──────────────────────────────────────────────
// FILE UPLOAD
// ──────────────────────────────────────────────
els.fileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (file) handleFile(file);
});

$('dropZone').addEventListener('click', () => els.fileInput.click());

function handleFile(file) {
  const reader = new FileReader();
  reader.onload = ev => {
    const dataUrl = ev.target.result;
    const [meta, b64] = dataUrl.split(',');
    state.imageMime = meta.match(/:(.*?);/)[1];
    state.imageBase64 = b64;
    els.previewImg.src = dataUrl;
    els.previewImg.classList.remove('hidden');
    $('dropContent').classList.add('hidden');
    els.btnChange.classList.remove('hidden');
    checkReady();
  };
  reader.readAsDataURL(file);
}

function checkReady() {
  els.btnGenerate.disabled = !(state.imageBase64 && els.apiKeyInput.value.length > 10);
}

// ──────────────────────────────────────────────
// GENERATE LOGIC
// ──────────────────────────────────────────────
els.btnGenerate.addEventListener('click', generate);
els.btnRegenerate.addEventListener('click', generate);

async function generate() {
  if (state.isLoading) return;
  const apiKey = els.apiKeyInput.value.trim();
  
  state.isLoading = true;
  showLoading();

  try {
    const result = await callGroq(apiKey);
    displayResult(result);
  } catch (err) {
    console.error(err);
    showToast("Error: " + err.message);
    showEmpty();
  } finally {
    state.isLoading = false;
  }
}

async function callGroq(apiKey) {
  const themeMap = {
    cinematic: 'Cinematic, grand, visual-heavy, high contrast',
    energetic: 'Fast-paced, vibrant colors, upbeat transitions',
    minimalist: 'Clean, simple, focus on product details, white space',
    'story-driven': 'Emotional, relatable scenario, narrative focus'
  };

  const target = els.targetInput.value || 'Umum';
  
  const prompt = `
Kamu adalah seorang Director Iklan dan Copywriter Senior.
Analisis foto produk ini dan buatkan NASKAH VIDEO IKLAN (Storyboard).

DETAIL IKLAN:
- Durasi: ${state.duration} Detik
- Tema: ${themeMap[state.theme]}
- Target Audiens: ${target}
- Bahasa: Bahasa Indonesia yang menarik dan persuasif.

OUTPUT HARUS BERUPA JSON MURNI DENGAN STRUKTUR BERIKUT:
{
  "product": "Nama produk",
  "headline": "Judul Iklan TV/Sosmed",
  "storyboard": [
    { "time": "00:00", "visual": "Deskripsi visual scene 1", "audio": "Voiceover atau musik background" },
    { "time": "00:05", "visual": "Deskripsi visual scene 2", "audio": "Voiceover atau SFX" }
  ],
  "cta": "Kalimat Call to Action penutup"
}

Buat scene yang proporsional dengan durasi total ${state.duration} detik. Pastikan output hanya JSON.
`.trim();

  const body = {
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: `data:${state.imageMime};base64,${state.imageBase64}` } }
        ]
      }
    ],
    temperature: 0.8,
    response_format: { type: "json_object" }
  };

  const url = "https://api.groq.com/openai/v1/chat/completions";

  const res = await fetch(url, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || "API Limit atau Error");
  }
  
  const data = await res.json();
  const text = data.choices[0].message.content;
  return JSON.parse(text);
}

function displayResult(data) {
  els.loadingState.classList.add('hidden');
  els.resultState.classList.remove('hidden');

  els.productName.textContent = data.product;
  els.headlineText.textContent = data.headline;
  els.ctaText.textContent = data.cta;
  
  els.resultDuration.textContent = `⏱️ ${state.duration} Detik`;
  els.resultStyle.textContent = `🎥 ${state.theme.charAt(0).toUpperCase() + state.theme.slice(1)}`;

  // Render Table
  let html = `<table class="sb-table">
    <thead>
      <tr><th>Waktu</th><th>Visual</th><th>Audio/VO</th></tr>
    </thead>
    <tbody>`;
  
  data.storyboard.forEach(s => {
    html += `<tr>
      <td class="sb-time">${s.time}</td>
      <td class="sb-visual">${s.visual}</td>
      <td class="sb-audio">${s.audio}</td>
    </tr>`;
  });
  html += `</tbody></table>`;
  els.storyboardContainer.innerHTML = html;

  // Full Script Text
  let fullScript = `PRODUCT: ${data.product}\nHEADLINE: ${data.headline}\n\nSTORYBOARD:\n`;
  data.storyboard.forEach(s => {
    fullScript += `[${s.time}] VISUAL: ${s.visual} | AUDIO: ${s.audio}\n`;
  });
  fullScript += `\nCTA: ${data.cta}`;
  els.captionText.textContent = fullScript;
  
  // Setup Video Player
  state.latestData = data;
  els.videoBgImage.src = `data:${state.imageMime};base64,${state.imageBase64}`;
  resetVideo();
}

// ──────────────────────────────────────────────
// VIDEO PLAYER ANIMATION
// ──────────────────────────────────────────────
els.btnPlayVideo.addEventListener('click', playVideo);

function resetVideo() {
  state.videoTimeoutIds.forEach(id => clearTimeout(id));
  state.videoTimeoutIds = [];
  els.videoBgImage.classList.remove('playing');
  els.videoHeadlineText.classList.remove('show');
  els.videoSubtitleText.classList.remove('show');
  els.videoProgressBar.style.transition = 'none';
  els.videoProgressBar.style.width = '0%';
  
  els.videoHeadlineText.textContent = '';
  els.videoSubtitleText.textContent = '';
}

function playVideo() {
  if (!state.latestData) return;
  const data = state.latestData;
  resetVideo();
  
  const totalDuration = parseInt(state.duration) * 1000;
  
  // Start animations
  setTimeout(() => {
    els.videoBgImage.classList.add('playing');
    els.videoProgressBar.style.transition = `width ${totalDuration}ms linear`;
    els.videoProgressBar.style.width = '100%';
  }, 50);

  let currentTime = 0;
  
  // 1. Intro (Headline)
  state.videoTimeoutIds.push(setTimeout(() => {
    els.videoHeadlineText.textContent = data.headline;
    els.videoSubtitleText.textContent = '';
    els.videoHeadlineText.classList.add('show');
  }, currentTime));
  
  currentTime += 3000;
  
  // 2. Storyboard scenes
  const timePerScene = Math.max(2000, (totalDuration - 6000) / Math.max(1, data.storyboard.length));
  
  data.storyboard.forEach((scene, index) => {
    state.videoTimeoutIds.push(setTimeout(() => {
      els.videoHeadlineText.classList.remove('show');
      els.videoSubtitleText.classList.remove('show');
      
      setTimeout(() => {
        // Clean up prefixes like "VO:", "Voiceover:", "Narator:"
        let cleanText = scene.audio.replace(/^(Voiceover|VO|Voice|Suara|Narator|Narrator|Audio)[\s:]*/i, '').trim();
        cleanText = cleanText.replace(/^["']|["']$/g, ''); // Remove quotes

        els.videoHeadlineText.textContent = cleanText;
        els.videoSubtitleText.textContent = ''; 
        els.videoHeadlineText.classList.add('show');
      }, 500); 
      
    }, currentTime));
    currentTime += timePerScene;
  });
  
  // 3. Outro (CTA)
  state.videoTimeoutIds.push(setTimeout(() => {
    els.videoHeadlineText.classList.remove('show');
    els.videoSubtitleText.classList.remove('show');
    
    setTimeout(() => {
      els.videoHeadlineText.textContent = data.cta;
      els.videoSubtitleText.textContent = "Powered by AdGenius AI";
      els.videoHeadlineText.classList.add('show');
      els.videoSubtitleText.classList.add('show');
    }, 500);
  }, totalDuration - 3000));
  
  // 4. End
  state.videoTimeoutIds.push(setTimeout(() => {
    resetVideo();
  }, totalDuration + 500));
}

function showLoading() {
  els.emptyState.classList.add('hidden');
  els.resultState.classList.add('hidden');
  els.loadingState.classList.remove('hidden');
}

function showEmpty() {
  els.loadingState.classList.add('hidden');
  els.emptyState.classList.remove('hidden');
}

function showToast(msg) {
  els.toastMsg.textContent = msg;
  els.toast.classList.add('show');
  els.toast.classList.remove('hidden');
  setTimeout(() => {
    els.toast.classList.remove('show');
    setTimeout(() => els.toast.classList.add('hidden'), 400);
  }, 2500);
}

checkReady();
