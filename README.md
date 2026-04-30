# WhatsApp Risk Checker

Web application that uses AI to analyze WhatsApp Business message templates and detect whether Meta would classify them as **Marketing** — which can lead to phone number restrictions or blocks.

## The Problem

Meta automatically categorizes WhatsApp Business message templates into three types: **Marketing**, **Utility**, and **Authentication**. Messages incorrectly submitted or borderline classified as Marketing are subject to higher costs, quality rating drops, and in recurring cases, progressive number blocks (1 to 30+ days).

This tool was built to protect operational continuity by giving teams a pre-send compliance layer.

## How It Works

1. The user types a WhatsApp message template
2. The backend sends it to **Llama 3.3 70B** (via Groq) with a specialized prompt trained on Meta's official classification criteria
3. The AI returns a structured risk analysis
4. A safe, rewritten version is generated automatically

## Features

- Risk classification: **Marketing / Utility / Borderline / Authentication**
- Risk score (0–100%) based on Meta's detection signals
- Highlights of problematic words and phrases
- Explanation of why Meta would flag or block the message
- AI-rewritten safe version ready to copy
- List of all changes made in the rewrite

## Tech Stack

- **Backend:** Node.js + Express
- **AI:** Groq API — Llama 3.3 70B Versatile
- **Frontend:** Vanilla HTML/CSS/JS (no build step)

## Setup

```bash
git clone https://github.com/ClebersonFlores/whatsapp-IA.git
cd whatsapp-IA
npm install
```

Create a `.env` file:

```
GROQ_API_KEY=your_groq_api_key_here
PORT=3000
```

Get a free API key at [console.groq.com](https://console.groq.com).

```bash
node server.js
```

Open `http://localhost:3000`.

## Meta Classification Criteria Used

The AI prompt is grounded in Meta's official WhatsApp Business Platform documentation:

- Template categorization rules (Marketing vs Utility)
- Signals that trigger automatic reclassification
- Policy enforcement and number quality rating system
- Prohibited content patterns and keywords
- Best practices for Utility template compliance
