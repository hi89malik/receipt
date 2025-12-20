# 🛒 Smart Pantry Tracker

**An AI-powered inventory management system that combats food waste by instantly digitizing grocery receipts.**

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688)
![Gemini 3](https://img.shields.io/badge/AI-Gemini%203%20Flash-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## 📖 The Problem
Food waste is a massive global issue, often caused simply by forgetting what we have in the fridge. Manual inventory tracking is tedious and friction-heavy. 

**The Solution:** A "zero-friction" input method. By snapping a photo of a receipt, this application uses Multimodal AI to extract items, identify their shelf life, and create a digital pantry instantly.

## ✨ Key Features

### 🧠 Multimodal AI Extraction (Gemini 3)
Instead of fragile OCR templates, this project uses **Google Gemini 3 Flash** (Multimodal LLM) to visually analyze receipts.
* **Resilient Parsing:** Handles crumpled paper, poor lighting, and non-standard layouts.
* **Semantic Understanding:** Distinguishes between "Gala Apples" (Food) and "Kitchen Towels" (Non-Food) automatically.

### 🕵️‍♂️ Hybrid Product Enrichment Agent
Standard barcode lookups fail on internal store codes (like Target DPCI). I engineered a **fallback agent** to solve this:
1.  **Level 1:** Checks open databases (Open Food Facts) for standard UPCs.
2.  **Level 2:** If failed, an **OSINT Search Agent** (using DuckDuckGo) "googles" the specific internal code (e.g., "Target DPCI 212141019") to identify the exact product name (e.g., *"Annie's White Cheddar Mac & Cheese"*).

### ⚡ Optimistic UI & Perceived Performance
* **Simulated Progress States:** Because AI processing varies in duration, the UI implements a heuristic-based progress bar to maintain user engagement.
* **Visual Feedback:** Immediate image previews and "Skeleton" loading states to ensure the app feels responsive even during heavy backend operations.

## 🛠️ Tech Stack

* **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide React.
* **Backend:** Python 3.9+, FastAPI, Uvicorn.
* **AI/ML:** Google Gemini 1.5/3 Flash, Pillow (Image Processing).
* **Data Enrichment:** `duckduckgo-search` (Web Scraping), `httpx` (Async HTTP requests).

## 🏗️ Architecture

```mermaid
graph LR
    A[User Uploads Image] --> B(Next.js Frontend)
    B --> C{FastAPI Backend}
    C --> D[Gemini 3 Vision Model]
    D --> E(Raw JSON Extraction)
    E --> F{Enrichment Agent}
    F -- UPC Code --> G[Open Food Facts DB]
    F -- Store Code --> H[DuckDuckGo Search]
    F --> I[Final JSON Response]
    I --> B
