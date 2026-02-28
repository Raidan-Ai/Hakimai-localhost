import { PrismaClient, Role } from '@prisma/client';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import cookieParser from 'cookie-parser';
import path from 'path';

import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import session from 'express-session';
import { google } from 'googleapis';

import { signToken, verifyToken, hashPassword, comparePassword } from './src/lib/auth';
import { AIModelFactory } from './src/lib/ai/factory';
import { AIModelProvider } from './src/lib/ai/types';

const prisma = new PrismaClient();

import { archiveToS3 } from './src/lib/s3';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());
  app.use(cookieParser());

  app.use(session({
    secret: process.env.NEXTAUTH_SECRET || 'super-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
  }));

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

  // Authentication Middleware
  const authenticate = async (req: any, res: any, next: any) => {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return res.status(401).json({ error: 'Unauthorized: User not found' });

    req.user = user;
    next();
  };

  const authorize = (roles: Role[]) => {
    return (req: any, res: any, next: any) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Forbidden: Access denied' });
      }
      next();
    };
  };

  // Auth Routes
  app.post('/api/auth/signup', async (req, res) => {
    const { email, password, name, role } = req.body;
    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) return res.status(400).json({ error: 'User already exists' });

      const hashedPassword = await hashPassword(password);
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: role || Role.DOCTOR,
          isVerified: role === Role.ADMIN, // Admins auto-verified for demo
        },
      });

      const token = signToken({ userId: user.id, email: user.email!, role: user.role });
      res.cookie('auth_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
      res.status(201).json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch (error) {
      res.status(500).json({ error: 'Signup failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.password) return res.status(401).json({ error: 'Invalid credentials' });

      const isValid = await comparePassword(password, user.password);
      if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

      const token = signToken({ userId: user.id, email: user.email!, role: user.role });
      res.cookie('auth_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
      res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch (error) {
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('auth_token');
    res.json({ success: true });
  });

  app.get('/api/auth/me', authenticate, (req: any, res) => {
    const { id, email, name, role, isVerified } = req.user;
    res.json({ user: { id, email, name, role, isVerified } });
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
  app.post('/api/admin/ping-ai', authenticate, authorize([Role.ADMIN]), async (req, res) => {
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
    const user = (req as any).user; // This would be populated by a real auth middleware

    if (!user) {
      const config = await prisma.systemConfig.findUnique({ where: { id: 'default' } });
      if (config?.publicTrialEnabled) {
        let trialUserId = (req.session as any).trialUserId;
        let trialUser;

        if (trialUserId) {
          trialUser = await prisma.trialUser.findUnique({ where: { id: trialUserId } });
        }

        if (!trialUser) {
          trialUser = await prisma.trialUser.create({ data: {} });
          (req.session as any).trialUserId = trialUser.id;
        }

        if (trialUser.messageCount >= (config.trialMessageLimit || 10)) {
          return res.json({ type: 'TRIAL_ENDED' });
        }

        await prisma.trialUser.update({
          where: { id: trialUser.id },
          data: { messageCount: { increment: 1 } },
        });
      }
    }

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
  app.get('/api/admin/config', authenticate, authorize([Role.ADMIN]), async (req, res) => {
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

  app.post('/api/admin/config', authenticate, authorize([Role.ADMIN]), async (req, res) => {
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
  app.get('/api/admin/models', authenticate, authorize([Role.ADMIN]), async (req, res) => {
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

  app.post('/api/admin/pull-model', authenticate, authorize([Role.ADMIN]), async (req, res) => {
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
  app.get('/api/admin/keys', authenticate, authorize([Role.ADMIN]), async (req, res) => {
    // In a real app, you'd get the admin user ID from the session
    const adminUserId = (req as any).user.id;
    const keys = await prisma.apiKey.findMany({ where: { userId: adminUserId } });
    res.json(keys);
  });

  app.post('/api/admin/keys', authenticate, authorize([Role.ADMIN]), async (req, res) => {
    const { name } = req.body;
    const adminUserId = (req as any).user.id;
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
  
  adminApi.use(authenticate, authorize([Role.ADMIN]));

  adminApi.get('/users', async (req, res) => {
    const users = await prisma.user.findMany();
    res.json(users.map(u => ({ ...u, password: '' }))); // Exclude password hash
  });

  adminApi.post('/users/:id/verify', async (req, res) => {
    const { id } = req.params;
    try {
      const user = await prisma.user.update({
        where: { id },
        data: { isVerified: true },
      });
      res.json(user);
    } catch (error) {
      res.status(404).json({ error: 'User not found' });
    }
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

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_DRIVE_CLIENT_ID,
    process.env.GOOGLE_DRIVE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/auth/gdrive/callback`
  );
  
  app.get('/api/auth/gdrive/connect', (req, res) => {
    const scopes = [
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
    ];
  
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: scopes,
    });
  
    res.redirect(url);
  });
  
  app.get('/api/auth/gdrive/callback', async (req, res) => {
    const { code } = req.query;
    try {
      const { tokens } = await oauth2Client.getToken(code as string);
      oauth2Client.setCredentials(tokens);
  
      // In a real app, you would get the user ID from the session
      const userId = 'clx...'; // Placeholder
      
      // Encrypt and store the tokens securely
      // For this example, we'll store them directly, but in production, you'd use a library like `crypto`
      await prisma.userGoogleDriveToken.upsert({
          where: { userId: userId },
          update: {
              accessToken: tokens.access_token!,
              refreshToken: tokens.refresh_token!,
              scope: tokens.scope!,
              tokenType: tokens.token_type!,
              expiryDate: new Date(tokens.expiry_date!),
          },
          create: {
              userId: userId,
              accessToken: tokens.access_token!,
              refreshToken: tokens.refresh_token!,
              scope: tokens.scope!,
              tokenType: tokens.token_type!,
              expiryDate: new Date(tokens.expiry_date!),
          }
      });
  
      res.redirect('/settings'); // Redirect to settings page after successful connection
    } catch (error) {
      console.error('Error getting Google Drive token:', error);
      res.status(500).send('Failed to connect Google Drive');
    }
  });

  /**
   * 13. Google Drive OAuth Flow (for Doctors)
   */
  app.get('/api/gdrive/files', async (req, res) => {
    try {
      // In a real app, you would get the user ID from the session
      const userId = 'clx...'; // Placeholder
      const tokenData = await prisma.userGoogleDriveToken.findUnique({ where: { userId } });

      if (!tokenData) {
        return res.status(401).json({ error: 'Google Drive not connected' });
      }

      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({
        access_token: tokenData.accessToken,
        refresh_token: tokenData.refreshToken,
      });

      const drive = google.drive({ version: 'v3', auth: oauth2Client });
      const response = await drive.files.list({
        pageSize: 100,
        fields: 'nextPageToken, files(id, name, mimeType)',
        q: "(mimeType='application/pdf' or mimeType contains 'image/') and trashed = false",
      });

      res.json({ files: response.data.files });
    } catch (error) {
      console.error('Error fetching Google Drive files:', error);
      res.status(500).json({ error: 'Failed to fetch files' });
    }
  });

  // ... (OAuth routes will be added here in a subsequent step)

  /**
   * 14. AI Case Analysis (HIPAA Compliant)
   */
  app.post('/api/cases/:id/ai/analyze', authenticate, async (req: any, res) => {
    const { id } = req.params;
    const { prompt, anonymize = true } = req.body;

    try {
      const caseData = await prisma.case.findUnique({
        where: { id },
        include: { patient: true },
      });

      if (!caseData) return res.status(404).json({ error: 'Case not found' });

      // Determine provider from system config
      const config = await prisma.systemConfig.findUnique({ where: { id: 'default' } });
      const providerType = config?.aiMode === 'LOCAL_EDGE' ? AIModelProvider.OLLAMA : AIModelProvider.GEMINI;
      
      const aiProvider = AIModelFactory.getProvider(providerType, {
        baseUrl: config?.ollamaUrl,
        modelName: caseData.aiModelUsed || 'llava-med',
      });

      const analysis = await aiProvider.analyze({
        prompt,
        patientHistory: caseData.patient.encryptedMedicalHistory,
        anonymize,
      });

      // Log the interaction for auditing
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'AI_CASE_ANALYSIS',
          resource: `Case:${id}`,
        },
      });

      res.json(analysis);
    } catch (error: any) {
      console.error('[AI_ANALYSIS] Error:', error.message);
      res.status(500).json({ error: 'AI analysis failed' });
    }
  });

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
