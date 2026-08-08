/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Gemini AI Diagnostic Assistant
  app.post('/api/ai/diagnose', async (req, res) => {
    try {
      const { telemetry, customerReportedIssue, deviceModel } = req.body;
      
      const prompt = `
        You are the D&CP LLC Senior Technical Diagnostic Assistant. 
        Analyze the following telemetry data and technician notes for a ${deviceModel} according to D&CP Engineering Specification Rev 4.0.
        
        INPUT DATA:
        - Technician/Customer Notes: "${customerReportedIssue}"
        - Battery Health: ${telemetry.batteryHealthPercentage}%
        - Battery Temperature: ${telemetry.batteryTempCelsius}°C
        - Ammeter DC Current Draw: ${telemetry.ammeterDrawAmps}A
        - Logical Short to Ground (Primary Rails): ${telemetry.isShortToGround ? 'POSITIVE' : 'NEGATIVE'}
        
        DIAGNOSTIC MANDATES:
        1. CLASSIFY SERVICE TIER: 
           - TIER 1 (Power/Port): < 1.0A draw, nominal rails.
           - TIER 2 (Display): Visual fault reported, current nominal.
           - TIER 3 (Board Rework): > 2.0A draw OR Short detected.
        
        2. TECHNICAL ANALYSIS:
           - If short detected: Evaluate VDD_MAIN and VDD_BOOST rails. Suggest thermal camera inspection or rosin cloud method for heat bloom detection.
           - If Current > 5.0A: Flag for immediate short-circuit rework (Level 2 VDD_MAIN short).
           - Calculate R_rail (Ohm's Law) if current is abnormal (assuming 4.2V nominal).
        
        3. SAFETY PROTOCOL:
           - If Temp > 45°C: Enforce MANDATORY thermal lockout status.
        
        4. CUSTOMER INVOICE SUMMARY:
           - Provide a professional, high-level summary of the diagnostic finding.
           - Mention compliance with WA RCW 19.415.
        
        Response must be structured, technical, and use markdown.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.HIGH
          }
        }
      });

      res.json({ analysis: response.text });
    } catch (error: any) {
      console.error('AI Error:', error);
      res.status(500).json({ error: 'Failed to generate diagnostic analysis' });
    }
  });

  // Shopify Intake Sync
  app.post('/api/intake/sync', async (req, res) => {
    const data = req.body;
    
    // In a real scenario, this would call the Shopify Admin GraphQL API
    // We'll mock the success for this demo as we don't have real keys
    console.log('Syncing with Shopify:', data);
    
    if (!process.env.SHOPIFY_STORE_DOMAIN || !process.env.SHOPIFY_ADMIN_API_TOKEN) {
      return res.json({ 
        success: true, 
        mocked: true,
        draftOrderId: 'gid://shopify/DraftOrder/123456789',
        invoiceUrl: 'https://checkout.shopify.com/mock-invoice'
      });
    }

    try {
      // Real implementation would go here using the spec's mutation
      res.json({ success: true, draftOrderId: 'gid://shopify/DraftOrder/987654321', invoiceUrl: '#' });
    } catch (error) {
      res.status(500).json({ success: false, errors: ['Shopify synchronization failed'] });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`D&CP LLC Server running on http://localhost:${PORT}`);
  });
}

startServer();
