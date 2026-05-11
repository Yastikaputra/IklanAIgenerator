# AdGenius AI 🎬🤖

**AdGenius AI** adalah aplikasi web generator iklan produk otomatis yang memanfaatkan kekuatan model AI Vision terbaru (**Groq Llama 4 Scout**). Hanya dengan mengunggah foto produk, AI akan membuatkan Naskah Video Iklan (Storyboard) secara instan beserta visualisasinya.

## Fitur Utama ✨
- **🧠 AI Vision Analysis**: Secara akurat mengidentifikasi fitur dan detail produk dari gambar.
- **⚡ Super Cepat**: Menggunakan Groq API (LPU Technology) yang memberikan hasil dalam hitungan detik.
- **📝 Naskah & Storyboard Otomatis**: Menghasilkan naskah adegan per adegan (*scene-by-scene*) lengkap dengan teks audio dan keterangan visual.
- **▶️ Auto-Animate Video Preview**: Fitur *simulator* video unik yang menganimasikan gambar produk dengan efek *Ken Burns* dan memutar naskah/subtitle secara otomatis di dalam browser (100% Client-side tanpa perlu me-render file MP4).
- **🎨 UI/UX Premium**: Desain *Glassmorphism* dengan Dark Mode dan micro-animations.

## Cara Penggunaan 🚀
Aplikasi ini berjalan sepenuhnya di sisi klien (*Client-side*) menggunakan Vanilla JavaScript.

1. Buka file `index.html` di browser web modern (atau gunakan ekstensi Live Server).
2. Dapatkan API Key Groq gratis di [console.groq.com/keys](https://console.groq.com/keys).
3. Masukkan API Key tersebut ke dalam kolom input yang tersedia di aplikasi.
4. Upload gambar produkmu (JPG, PNG, WEBP).
5. Pilih **Durasi Video** (15s, 30s, 60s) dan **Tema Video** yang diinginkan.
6. Klik **Generate Iklan**.
7. Nikmati hasil naskahnya dan klik tombol **Play Video** untuk melihat simulasi videonya secara langsung!

## Teknologi yang Digunakan 💻
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+).
- **AI / LLM API**: [Groq API](https://groq.com)
- **Model AI Utama**: `meta-llama/llama-4-scout-17b-16e-instruct`

## Catatan Keamanan 🔒
API Key dari pengguna tidak disimpan di mana pun selain dimuat di memori browser saat sesi berjalan. Kami *tidak menyematkan* (hardcode) API Key di dalam _source code_ publik demi alasan keamanan.

---
Dibuat untuk eksplorasi potensi AI Generatif dalam pembuatan kampanye iklan digital yang instan dan menarik.
