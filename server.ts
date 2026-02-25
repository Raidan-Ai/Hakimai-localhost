import { PrismaClient } from '@prisma/client';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import cookieParser from 'cookie-parser';
import path from 'path';

import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

import { archiveToS3 } from './src/lib/s3';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Mock Subdomain Middleware for Express (since we are in a non-Next.js environment)
  // This mimics the behavior requested for the Next.js middleware
  app.use((req, res, next) => {
    const hostname = req.get('host') || '';
    
    // In this environment, we might not have real subdomains, 
    // but we can simulate the logic for the architecture demonstration.
    (req as any).isAdminSubdomain = hostname.startsWith('admin.');
    (req as any).isAppSubdomain = hostname.startsWith('app.');
    
    next();
  });

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'Hakim AI Systems Operational', timestamp: new Date().toISOString() });
  });

  /**
   * 1. Local Dialect Scribe AI
   * Processes consultation audio using a private Whisper model.
   */
  app.post('/api/scribe', async (req, res) => {
    // In a real scenario, we would receive a multipart/form-data audio blob.
    // For this demo, we'll simulate the forwarding to our private Edge server.
    console.log('[SCRIBE] Received audio blob. Forwarding to private Whisper-Yemeni-Dialect server...');

    // Simulate the private server response
    const simulatedTranscription = "المريض يعاني من حمى شديدة وألم في المفاصل منذ يومين. لا يوجد سعال.";
    
    // Structure into a JSON SOAP note
    const soapNote = {
      subjective: "Patient reports high fever and severe joint pain for 2 days. No cough reported.",
      objective: "Simulated: Temperature 39.5C, HR 110, BP 110/70.",
      assessment: "Suspected viral infection, differential diagnosis includes Dengue or Malaria.",
      plan: "Order CBC, NS1 antigen test. Hydration and paracetamol."
    };

    res.json({
      transcription: simulatedTranscription,
      soapNote,
      model: "Whisper-v3-Yemeni-FineTuned"
    });
  });

  /**
   * 2. Legacy Archive Digitization
   * Uses Gemini Vision to extract data from handwritten records.
   */
  app.post('/api/digitize', async (req, res) => {
    const { imageBase64 } = req.body;
    
    if (!imageBase64) return res.status(400).json({ error: "No image data provided" });

    console.log('[DIGITIZE] Processing handwritten record with Gemini Vision...');

    // In a real scenario, we would call Gemini Vision here.
    // We'll simulate the structured extraction.
    const extractedData = {
      patientName: "Ahmed Al-Fulan",
      history: "History of hypertension and type 2 diabetes.",
      medications: [
        { name: "Amlodipine", dosage: "5mg", frequency: "Once daily" },
        { name: "Metformin", dosage: "500mg", frequency: "Twice daily" }
      ],
      lastVisitDate: "2023-11-15"
    };

    res.json({
      success: true,
      data: extractedData,
      model: "Gemini 2.5 Flash Vision"
    });
  });

  /**
   * 3. WhatsApp Triage Webhook
   * Receives symptom text and performs non-diagnostic AI triage.
   */
  app.post('/api/webhook/whatsapp', async (req, res) => {
    const { From, Body } = req.body; // Standard Twilio/WhatsApp payload
    
    console.log(`[WHATSAPP] Received message from ${From}: ${Body}`);

    // Perform AI Triage (Simulated)
    const triageResult = {
      urgency: "MODERATE",
      recommendation: "Please visit the nearest clinic within 24 hours for a physical examination.",
      possibleSymptoms: ["Fever", "Fatigue"]
    };

    // Save to database (Simulated)
    // await prisma.triageData.create({ data: { symptomsText: Body, geographicLocation: 'WhatsApp' } });

    res.json({
      status: "received",
      triage: triageResult
    });
  });

  /**
   * 4. Outbreak Radar Data
   * Fetches anonymized triage data for visualization.
   */
  app.get('/api/outbreak-data', (req, res) => {
    // Mock data for the last 48 hours
    const data = [
      { timestamp: '2026-02-23T10:00:00Z', location: 'North District', symptoms: 'Fever, Joint Pain', count: 12 },
      { timestamp: '2026-02-23T14:00:00Z', location: 'South District', symptoms: 'Cough', count: 5 },
      { timestamp: '2026-02-24T09:00:00Z', location: 'North District', symptoms: 'Fever, Joint Pain', count: 28 }, // Spike!
      { timestamp: '2026-02-24T12:00:00Z', location: 'East District', symptoms: 'Headache', count: 8 },
      { timestamp: '2026-02-24T15:00:00Z', location: 'North District', symptoms: 'Fever, Joint Pain', count: 35 }, // Spike!
    ];

    res.json(data);
  });

  /**
   * 6. Connection Ping Utility
   * Safely attempts a health-check to a local AI endpoint.
   */
  app.post('/api/admin/ping-ai', async (req, res) => {
    const { url, provider } = req.body;

    if (!url) return res.status(400).json({ error: 'URL is required' });

    console.log(`[ADMIN] Pinging ${provider} at ${url}...`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      // Different providers have different health check endpoints
      let pingUrl = url;
      if (provider === 'Ollama') {
        pingUrl = `${url.replace(/\/$/, '')}/api/tags`; // Ollama tags endpoint is a good health check
      } else if (provider === 'LM Studio' || provider === 'Custom OpenAI-Compatible API') {
        pingUrl = `${url.replace(/\/$/, '')}/models`; // OpenAI compatible models endpoint
      }

      const response = await fetch(pingUrl, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        res.json({ success: true, status: response.status, message: 'Connection successful' });
      } else {
        res.status(response.status).json({ success: false, status: response.status, message: `Provider returned ${response.status}` });
      }
    } catch (error: any) {
      console.error('[ADMIN] Ping failed:', error.message);
      res.status(500).json({ 
        success: false, 
        message: error.name === 'AbortError' ? 'Connection timed out' : 'Connection failed. Ensure the provider is running and CORS is allowed.' 
      });
    }
  });

  /**
   * 7. Mixture of Experts Router
   * Determines if a request should go to public Gemini Cloud or Private Edge AI.
   */
  app.post('/api/chat', upload.single('file'), async (req, res) => {
    const { prompt } = req.body;
    const file = req.file;

    // PHI Detection Logic (Simplified for demo)
    const phiPatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b(DOB|Date of Birth)\b/i,
      /\b(Patient Name|Name:)\b/i,
      /\b(MRN|Medical Record Number)\b/i
    ];

    const hasPHI = phiPatterns.some(pattern => pattern.test(prompt));
    const hasMedicalImages = file && (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf');

    // ROUTING LOGIC
    if (hasPHI || hasMedicalImages) {
      console.log('[ORCHESTRATOR] Routing to: 🔒 Local Sovereign AI (Edge Server)');
      
      if (file) {
        try {
          const s3Url = await archiveToS3(file);
          console.log(`[S3] File archived to: ${s3Url}`);
        } catch (error) {
          console.error('[S3] Archiving failed:', error);
          // Decide if this should be a hard failure or just a warning
        }
      }

      // In a real scenario, we would proxy to: https://ai-core.raidan.pro/api/llava
      // For this demo, we'll simulate a secure response
      return res.json({
        model: 'Local Sovereign AI',
        isSecure: true,
        text: "This request contains sensitive PHI or radiology data. It has been processed on the local raidan.pro Edge AI server to ensure HIPAA compliance. \n\nAnalysis: The uploaded image shows clear signs of [SIMULATED_FINDING]. No data has left the local network."
      });
    }

    console.log('[ORCHESTRATOR] Routing to: ⚡ Gemini Cloud');
    // Signal to the frontend that it's safe to use Gemini Cloud
    return res.json({
      model: 'Gemini Cloud',
      isSecure: false,
      routeToClient: true,
      message: "General medical reasoning requested. Safe for public cloud processing."
    });
  });

  /**
   * 2. Ask PubMed RAG
   * Mocks a query to a medical literature database.
   */
  app.post('/api/pubmed', (req, res) => {
    const { query } = req.body;
    
    // Mocked RAG response with evidence-based citations
    const mockCitations = [
      { id: 'PMID: 3421567', title: 'Advancements in Clinical AI', journal: 'NEJM', year: 2024 },
      { id: 'PMID: 1109283', title: 'HIPAA Compliance in Cloud Systems', journal: 'JAMA', year: 2023 }
    ];

    res.json({
      answer: `Based on current literature regarding "${query}", evidence suggests that [MOCK_EVIDENCE_SUMMARY].`,
      citations: mockCitations,
      source: 'PubMed Central'
    });
  });

  // Audit Log Endpoint (Example)
  app.post('/api/audit', (req, res) => {
    const { action, resource, userId } = req.body;
    console.log(`[AUDIT] User ${userId} performed ${action} on ${resource}`);
    res.status(201).json({ success: true });
  });

  /**
   * 8. Admin Runtime Configuration
   */
  app.get('/api/admin/config', async (req, res) => {
    try {
      let config = await prisma.systemConfig.findUnique({ where: { id: 'default' } });
      if (!config) {
        config = await prisma.systemConfig.create({
          data: { id: 'default' }
        });
      }
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch configuration' });
    }
  });

  app.post('/api/admin/config', async (req, res) => {
    try {
      const config = await prisma.systemConfig.upsert({
        where: { id: 'default' },
        update: req.body,
        create: { ...req.body, id: 'default' }
      });
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update configuration' });
    }
  });

  /**
   * 9. Local AI Model Manager (Ollama Proxy)
   */
  app.get('/api/admin/models', async (req, res) => {
    try {
      const config = await prisma.systemConfig.findUnique({ where: { id: 'default' } });
      const ollamaUrl = config?.ollamaUrl || 'http://127.0.0.1:11434';
      
      const response = await fetch(`${ollamaUrl.replace(/\/$/, '')}/api/tags`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch local models. Ensure Ollama is running.' });
    }
  });

  app.post('/api/admin/pull-model', async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Model name is required' });

    try {
      const config = await prisma.systemConfig.findUnique({ where: { id: 'default' } });
      const ollamaUrl = config?.ollamaUrl || 'http://127.0.0.1:11434';

      console.log(`[ADMIN] Pulling model ${name} from ${ollamaUrl}...`);

      const response = await fetch(`${ollamaUrl.replace(/\/$/, '')}/api/pull`, {
        method: 'POST',
        body: JSON.stringify({ name, stream: true }),
      });

      if (!response.body) throw new Error('No response body from Ollama');

      // Stream the progress back to the client
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        res.write(chunk);
      }
      res.end();
    } catch (error: any) {
      console.error('[ADMIN] Pull failed:', error.message);
      res.status(500).json({ error: 'Failed to pull model' });
    }
  });

  /**
   * 10. API Key Management
   */
  app.get('/api/admin/keys', async (req, res) => {
    // In a real app, you'd get the admin user ID from the session
    const adminUserId = 'clx...'; // Placeholder
    const keys = await prisma.apiKey.findMany({ where: { userId: adminUserId } });
    res.json(keys);
  });

  app.post('/api/admin/keys', async (req, res) => {
    const { name } = req.body;
    const adminUserId = 'clx...'; // Placeholder
    const key = `hakim_${randomBytes(16).toString('hex')}`;

    const newKey = await prisma.apiKey.create({
      data: { name, key, userId: adminUserId },
    });
    res.status(201).json(newKey);
  });

  /**
   * 11. Public Inference API (v1)
   */
  const apiV1 = express.Router();
  apiV1.use(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing API Key' });
    }
    const key = authHeader.split(' ')[1];
    const apiKey = await prisma.apiKey.findUnique({ where: { key } });
    if (!apiKey) {
      return res.status(403).json({ error: 'Forbidden: Invalid API Key' });
    }
    next();
  });

  apiV1.post('/infer', async (req, res) => {
    const { prompt, model } = req.body;
    // Here you would use LiteLLM to route to the correct model
    res.json({ response: `Inference result for: ${prompt}` });
  });

  app.use('/api/v1', apiV1);

  /**
   * 12. User Management (Admin Only)
   */
  const adminApi = express.Router();
  
  // Middleware to check for ADMIN role
  adminApi.use(async (req, res, next) => {
    // In a real app, you'd get the user from a session and check their role
    const is_admin = true; // Placeholder for session check
    if (is_admin) {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden: Access denied' });
    }
  });

  adminApi.get('/users', async (req, res) => {
    const users = await prisma.user.findMany();
    res.json(users.map(u => ({ ...u, password: '' }))); // Exclude password hash
  });

  adminApi.post('/users', async (req, res) => {
    const { email, name, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { email, name, password: hashedPassword, role },
    });
    res.status(201).json(newUser);
  });

  app.use('/api/admin', adminApi);

  /**
   * 13. Google Drive OAuth Flow (for Doctors)
   */
  // ... (OAuth routes will be added here in a subsequent step)

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hakim AI Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
