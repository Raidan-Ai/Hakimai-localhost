import express from 'express';
import { createServer as createViteServer } from 'vite';
import cookieParser from 'cookie-parser';
import path from 'path';

async function startServer() {
  const app = express();
  const PORT = 3000;

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
   * 5. Mixture of Experts Router
   * Determines if a request should go to public Gemini Cloud or Private Edge AI.
   */
  app.post('/api/chat', async (req, res) => {
    const { prompt, files } = req.body;

    // PHI Detection Logic (Simplified for demo)
    const phiPatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b(DOB|Date of Birth)\b/i,
      /\b(Patient Name|Name:)\b/i,
      /\b(MRN|Medical Record Number)\b/i
    ];

    const hasPHI = phiPatterns.some(pattern => pattern.test(prompt));
    const hasMedicalImages = files?.some((f: any) => 
      f.type?.includes('image/') && (prompt.toLowerCase().includes('x-ray') || prompt.toLowerCase().includes('mri'))
    );

    // ROUTING LOGIC
    if (hasPHI || hasMedicalImages) {
      console.log('[ORCHESTRATOR] Routing to: 🔒 Local Sovereign AI (Edge Server)');
      
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
