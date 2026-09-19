# alfavz.dl — Vercel Deploy

## Struktur
```
downloader/
├── api/
│   └── proxy.js      ← Serverless function (proxy ke Fareza & Hazel API)
├── public/
│   └── index.html    ← Frontend
├── vercel.json       ← Config routes + function settings
└── README.md
```

## Deploy ke Vercel

### 1. Push ke GitHub
```bash
cd downloader
git init
git add .
git commit -m "init"
gh repo create alfavz-dl --public --push
```

### 2. Import di Vercel
- Buka vercel.com → New Project → import repo
- Framework Preset: **Other**
- Root Directory: `.` (default)

### 3. Set Environment Variables
Di Vercel dashboard → Settings → Environment Variables:
```
HAZEL_APIKEY = zelapi-xxxxxxx
```

### 4. Deploy
Vercel otomatis deploy. Done!

## Cara kerja proxy
Semua request dari frontend:
```
/api/proxy?target=https://api.fareza.eu.cc/download/tiktok?url=...
```
→ Proxy forward ke upstream API
→ Return response ke frontend
→ CORS beres, API key aman di server
