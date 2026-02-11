import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Resend } from 'resend';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

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
