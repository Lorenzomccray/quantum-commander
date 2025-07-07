# QuantumGUI

> A fully dynamic React + Vite frontend for Quantum Commander AI Assistant.

### 🧠 Features
- Tailwind CSS styling
- Natural language chat interface
- Dynamic port detection (no default fallback)

### 🚀 Setup
```bash
npm install
npm run dev
```

Set backend port (optional):
```bash
cp .env.template .env
# Edit VITE_ASSISTANT_PORT if needed
```

If no environment port is provided, the app will read `.port` if present or
fall back to scanning for an available local port.

---

> You can later link this with:
```bash
qc upgrade --url https://github.com/YOUR_USERNAME/QuantumGUI.git
```
