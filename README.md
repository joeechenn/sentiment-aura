# Sentiment Aura

A real-time AI-powered emotional visualization system that transforms spoken words into dynamic, generative art.

## Overview

Sentiment Aura captures live audio, transcribes speech in real-time, analyzes emotional sentiment using LLMs, and visualizes the data as an evolving Perlin noise field. The visualization's color, energy, and form shift dynamically to reflect the speaker's emotional tone.

## Architecture

**Frontend (React + TypeScript)**
- Audio capture via Web Audio API
- Real-time transcription through Deepgram WebSocket
- Dynamic Perlin noise visualization with react-p5
- Smooth UI animations and transitions

**Backend (FastAPI + Python)**
- Server for secure LLM API calls
- Sentiment analysis and keyword extraction
- WebSocket and REST API integration

**External APIs**
- Deepgram: Real-time audio transcription
- OpenAI: Sentiment analysis and keyword extraction

## Prerequisites
- Node.js 16+
- Python 3.8+
- API Keys:
  - Deepgram API key
  - OpenAI API key

## Installation

### Backend Setup

```bash
# Navigate to backend dir
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file and add your API key
echo "OPENROUTER_API_KEY=your_key_here" > .env
```

### Frontend Setup

```bash
# Navigate to frontend dir
cd frontend

# Install dependencies
npm install

# Create .env file and add your API key
echo "REACT_APP_DEEPGRAM_API_KEY=your_key_here" > .env
```

## Running the Application

### Start Backend Server

```bash
# From backend dir with venv activated
uvicorn main:app --reload
```

Backend will run at `http://localhost:8000`

### Start Frontend

```bash
# From frontend dir
npm start
```

Frontend will run at `http://localhost:3000`

## Usage

1. Click the **microphone button** to begin recording
2. Allow microphone access when prompted
3. Speak - your words will appear as live transcription
4. Watch the visualization shift colors and patterns based on sentiment:
   - **Blue/Purple**: Negative sentiment
   - **Orange/Yellow**: Positive sentiment
   - **Flow intensity**: Reflects emotional intensity
5. Keywords extracted from speech appear with smooth fade-in animations
6. Click the **microphone button** again to stop recording

## Design Decisions

**Visualization Mapping:**
- Sentiment score (-1 to +1) maps to color spectrum (blue to purple to orange/yellow)
- Particle flow speed increases with emotional intensity
- 25,000 particles create a dense, fluid "aura" effect
- Layered opacity adds depth and richness

**UI Polish:**
- Keywords fade in rather than popping
- Transcription auto-scrolls with smooth animations
- Semi-transparent overlays maintain focus on the visualization

## Technologies

- React, TypeScript, react-p5
- FastAPI, Python, uvicorn
- Deepgram API, OpenAI API
- Perlin noise field generation

---

Built with love and passion for Memory Machines
