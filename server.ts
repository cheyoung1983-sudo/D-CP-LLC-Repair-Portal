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

  // Repair Status Tracker API
  app.get('/api/repair-status/:ticketNumber', (req, res) => {
    const ticketNumber = req.params.ticketNumber.trim().toUpperCase();

    // Default mock stage mapping for predefined tickets or custom user tickets
    const sampleTickets: Record<string, any> = {
      'DCP-8842': {
        ticketNumber: 'DCP-8842',
        customerName: 'Alex Mercer',
        deviceModel: 'iPhone 15 Pro Max',
        serviceTier: 'Tier 3 (Board Rework)',
        currentStage: 3,
        estimatedCompletionDate: 'Tomorrow at 4:00 PM',
        technicianNotes: 'VDD_MAIN short located near U3100 PMIC. Micro-soldering rework underway. Rosin cloud test confirmed 4.8A thermal bloom.',
        telemetrySummary: {
          batteryHealthPercentage: 88,
          batteryTempCelsius: 34,
          ammeterDrawAmps: 4.8,
          isShortToGround: true,
        },
        lastUpdated: '10 minutes ago',
      },
      'DCP-9012': {
        ticketNumber: 'DCP-9012',
        customerName: 'Sarah Jenkins',
        deviceModel: 'Samsung Galaxy S24 Ultra',
        serviceTier: 'Tier 2 (Display Renewal)',
        currentStage: 4,
        estimatedCompletionDate: 'Today at 5:30 PM',
        technicianNotes: 'OEM Display Assembly installed. Passing 45°C thermal stress test and digitizer touch grid calibration.',
        telemetrySummary: {
          batteryHealthPercentage: 94,
          batteryTempCelsius: 31,
          ammeterDrawAmps: 0.85,
          isShortToGround: false,
        },
        lastUpdated: '25 minutes ago',
      },
      'DCP-3109': {
        ticketNumber: 'DCP-3109',
        customerName: 'Marcus Vance',
        deviceModel: 'iPad Pro 12.9" (M2)',
        serviceTier: 'Tier 1 (Power/Port Refresh)',
        currentStage: 5,
        estimatedCompletionDate: 'Completed',
        technicianNotes: 'FPC Port replaced. Charge current nominal at 2.1A. Ready for customer pickup at Spokane Lab HQ.',
        telemetrySummary: {
          batteryHealthPercentage: 91,
          batteryTempCelsius: 28,
          ammeterDrawAmps: 2.1,
          isShortToGround: false,
        },
        lastUpdated: '1 hour ago',
      }
    };

    if (sampleTickets[ticketNumber]) {
      return res.json({ success: true, ticket: sampleTickets[ticketNumber] });
    }

    // Dynamic mock for any other valid ticket number format
    const stages = [1, 2, 3, 4, 5];
    const numHash = ticketNumber.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const mockStage = stages[numHash % stages.length];

    res.json({
      success: true,
      ticket: {
        ticketNumber,
        customerName: 'Verified Customer',
        deviceModel: 'Mobile Communications Unit',
        serviceTier: mockStage > 2 ? 'Tier 3 (Board Rework)' : 'Tier 2 (Display Renewal)',
        currentStage: mockStage,
        estimatedCompletionDate: mockStage === 5 ? 'Completed' : 'Within 24 Hours',
        technicianNotes: `Ticket ${ticketNumber} is active in D&CP Spokane Lab. Current stage: ${mockStage}/5. Telemetry diagnostics active.`,
        telemetrySummary: {
          batteryHealthPercentage: 85 + (numHash % 12),
          batteryTempCelsius: 30 + (numHash % 10),
          ammeterDrawAmps: mockStage > 2 ? 2.45 : 0.65,
          isShortToGround: mockStage > 2,
        },
        lastUpdated: 'Just now'
      }
    });
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
