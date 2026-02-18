import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Resend } from 'resend';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// USE THIS EXACT LINE:
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Operational', timestamp: new Date().toISOString() });
});

// AI Command endpoint for Kessler Terminal
app.post('/api/ai/command', async (req, res) => {
  const { command } = req.body;

  try {
    if (!command) {
      return res.status(400).json({ error: 'Command required' });
    }

    // Add context for space debris analysis
    const systemPrompt = `
  IDENTITY: You are "Orion", a Senior Orbital Analyst at SDCRA. 
  CONTEXT: You are chatting with a user who is looking at our 3D debris tracking dashboard.
  
  YOUR PERSONALITY:
  1. HUMAN: Speak like a NASA engineer, not a robot. Be calm, professional, and slightly casual.
  2. NAME: Refer to yourself as "Orion" if asked.
  3. STYLE: Use short, punchy sentences. Avoid "AI" fluff like "How can I assist you today?".
  4. KNOWLEDGE: You know everything about SDCRA project (React/Three.js dashboard) and orbital mechanics.
  
  EXAMPLES:
  - User: "Hello"
    -> You: "Orion here. Uplink is stable. What sector are we looking at?"
  
  - User: "What is ISS status?"
    -> You: "Station looks good. Orbiting at 408km. Crew is currently asleep."
    
  - User: "What is Kessler Syndrome?"
    -> You: "It's nightmare scenario. One collision creates debris, which causes more collisions. Chain reaction. We're here to prevent that."

  USER INPUT: "${command}"
`;

    const result = await model.generateContent(systemPrompt);
    const response = result.response.text();
    
    res.json({ response });
  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({ 
      error: 'AI service unavailable',
      message: 'Cloud connection unstable' 
    });
  }
});

// Celestrak proxy endpoints to solve CORS/HTTPS issues
app.get('/api/celestrak/*', async (req, res) => {
  try {
    const celestrakUrl = `https://celestrak.org${req.path.replace('/api/celestrak', '')}`;
    console.log(`🛰️ Proxying request to: ${celestrakUrl}`);
    
    const response = await fetch(celestrakUrl);
    
    if (!response.ok) {
      throw new Error(`Celestrak API error: ${response.status} ${response.statusText}`);
    }
    
    // Set appropriate headers
    res.set({
      'Content-Type': response.headers.get('Content-Type') || 'text/plain',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    
    const data = await response.text();
    res.send(data);
    
  } catch (error) {
    console.error('Celestrak proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch satellite data',
      message: error.message 
    });
  }
});

// Alternative Celestrak proxy (for celestrak.com)
app.get('/api/celestrak-com/*', async (req, res) => {
  try {
    const celestrakUrl = `https://celestrak.com${req.path.replace('/api/celestrak-com', '')}`;
    console.log(`🛰️ Proxying request to: ${celestrakUrl}`);
    
    const response = await fetch(celestrakUrl);
    
    if (!response.ok) {
      throw new Error(`Celestrak API error: ${response.status} ${response.statusText}`);
    }
    
    // Set appropriate headers
    res.set({
      'Content-Type': response.headers.get('Content-Type') || 'text/plain',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    
    const data = await response.text();
    res.send(data);
    
  } catch (error) {
    console.error('Celestrak proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch satellite data',
      message: error.message 
    });
  }
});

// Send email endpoint
app.post('/api/send-email', async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const data = await resend.emails.send({
      from: 'SDCRA Contact <onboarding@resend.dev>', // Rule 1: Must be this exact email
      to: 'arpitsharma0004@gmail.com',                // Rule 2: Must be YOUR verified email
      reply_to: email,                                // <--- TRICK: This lets you hit "Reply" to answer them!
      subject: `[SDCRA] Encrypted Transmission from ${name}`,
      html: `
        <h3>New Mission Intel</h3>
        <p><strong>Agent Name:</strong> ${name}</p>
        <p><strong>Secure Frequency:</strong> ${email}</p>
        <hr />
        <p><strong>Intel:</strong></p>
        <p>${message}</p>
      `
    });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: 'Transmission system malfunction'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.path 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SDCRA Transmission Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📧 Email endpoint: http://localhost:${PORT}/api/send-email`);
  console.log(`🔐 Resend API Key: ${process.env.RESEND_API_KEY ? 'Loaded' : 'NOT FOUND'}`);
});

export default app;
