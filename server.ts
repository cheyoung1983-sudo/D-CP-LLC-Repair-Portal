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

  // Support Message API
  app.post('/api/support/message', async (req, res) => {
    const { name, email, subject, message } = req.body;
    
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    console.log('Support message received:', { name, email, subject, message });
    
    // Simulate processing
    res.json({ 
      success: true, 
      messageId: `msg_${Math.random().toString(36).substring(2, 11)}`,
      status: 'Queued for Lab Review' 
    });
  });

  // Real-time Support Chat API
  app.post('/api/support/chat', async (req, res) => {
    try {
      const { message, conversationHistory, ticketId } = req.body;
      
      if (!message) {
        return res.status(400).json({ success: false, error: 'Message is required' });
      }

      if (process.env.GEMINI_API_KEY) {
        const historyText = Array.isArray(conversationHistory) 
          ? conversationHistory.map((m: any) => `${m.sender === 'user' ? 'Customer' : 'Technician David'}: ${m.text}`).join('\n')
          : '';

        const systemPrompt = `
You are David Chen, Lead Systems Engineer at D&CP LLC (Spokane Lab, WA).
You are answering a live support chat with a customer.
Key Details:
- D&CP provides hardware diagnostics, display renewals, battery replacements, and Tier 3 micro-soldering (VDD_MAIN shorts, BGA reballing, data recovery).
- Spokane Lab Address: 115 S Adams St, Spokane, WA 99201.
- Turnaround: Tier 1 (1-2 hours), Tier 2 (Same day), Tier 3 (24-48 hours).
- Warranty: Lifetime warranty on OEM-spec parts and workmanship.
- Compliance: Washington RCW 19.415 data privacy compliant.
${ticketId ? `- Active Customer Ticket ID referenced: ${ticketId}` : ''}

Respond concisely (2-4 sentences max), professionally, and directly in character as David Chen.
Provide clear technical guidance, reassure data privacy, and suggest next steps (e.g. submitting an Intake form or using the Repair Status tracker).
        `;

        const userPrompt = `Recent Chat History:\n${historyText}\n\nCustomer Message: "${message}"\n\nProvide David Chen's reply:`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
          }
        });

        return res.json({
          success: true,
          reply: response.text || "Thank you for reaching out to D&CP Spokane Lab. Our engineering bench is currently analyzing your query.",
          technician: {
            name: "David Chen",
            title: "Lead Systems Engineer",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
          }
        });
      }

      // Smart fallback responses if Gemini API Key is not set
      let reply = "Thank you for contacting Spokane Lab HQ. Our bench technicians are standing by. For immediate status updates, please check the Repair Status Tracker or submit a formal Intake Form.";
      const lower = message.toLowerCase();

      if (lower.includes('status') || lower.includes('ticket') || lower.includes('dcp-')) {
        reply = "I can assist with ticket telemetry! Please ensure your Ticket ID (e.g., DCP-8842) is entered into our 'Repair Status Tracker' tab for real-time oscilloscope and voltage readings directly from our bench.";
      } else if (lower.includes('price') || lower.includes('cost') || lower.includes('quote') || lower.includes('how much')) {
        reply = "Our pricing is transparent: Tier 1 (Power/Battery) starts around $65–$85, Tier 2 (OLED Display) starts around $145–$185, and Tier 3 (Logic Board micro-soldering) is custom evaluated after diagnostic triage. You can use our Repair Estimate Calculator for an instant quote.";
      } else if (lower.includes('data') || lower.includes('privacy') || lower.includes('passcode') || lower.includes('safe')) {
        reply = "Data security is our top priority. We operate under strict RCW 19.415 compliance. We never ask for device passcodes for standard hardware repairs unless calibration is required.";
      } else if (lower.includes('hour') || lower.includes('open') || lower.includes('location') || lower.includes('spokane')) {
        reply = "Our Spokane Lab at 115 S Adams St is open Mon-Fri, 8:00 AM – 6:00 PM PST. Live bench technicians are on duty during these hours!";
      } else if (lower.includes('water') || lower.includes('liquid') || lower.includes('short') || lower.includes('soldering')) {
        reply = "For liquid damage or board shorts, do NOT attempt to charge the device. Bring or ship it to Spokane Lab immediately for ultrasonic cleaning and rosin cloud thermal isolation.";
      }

      return res.json({
        success: true,
        reply,
        technician: {
          name: "David Chen",
          title: "Lead Systems Engineer",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
        }
      });
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ 
        success: false, 
        reply: "Our bench network experienced a transient signal interrupt. Please retry or transmit an email inquiry.",
        technician: {
          name: "Spokane Lab Support",
          title: "Engineering Queue",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
        }
      });
    }
  });

  // Repair Academy AI Video Generator API
  app.post('/api/academy/generate-video', async (req, res) => {
    try {
      const { topic } = req.body;

      if (!topic) {
        return res.status(400).json({ success: false, error: 'Topic is required' });
      }

      if (process.env.GEMINI_API_KEY) {
        const prompt = `
You are the Master Educational Director at D&CP Spokane Repair Academy.
Generate a structured, step-by-step video tutorial script and scene specification for a short DIY electronics repair tutorial on: "${topic}".

Return ONLY a valid JSON object strictly matching this format without markdown code blocks:
{
  "id": "vid-custom-1",
  "title": "Title of Tutorial",
  "category": "Display" | "Power" | "Cleanliness" | "ESD" | "Tools",
  "difficulty": "Beginner" | "Intermediate" | "Advanced",
  "estimatedTime": "2 mins",
  "description": "Short 1-2 sentence overview of the tutorial.",
  "requiredTools": ["Tool 1", "Tool 2"],
  "safetyWarnings": ["Warning 1", "Warning 2"],
  "scenes": [
    {
      "stepNumber": 1,
      "title": "Scene Title",
      "narration": "Exact spoken voiceover narration script for this step.",
      "durationSeconds": 6,
      "visualPrompt": "Detailed visual description of the bench demonstration.",
      "graphicType": "cleaning" | "cable" | "microscope" | "battery" | "tool" | "warning",
      "highlightRegion": { "x": 50, "y": 50, "label": "Key Component" },
      "actionTip": "Pro technician tip for executing this step safely."
    }
  ]
}
Generate exactly 4-5 well-thought-out scenes.
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          }
        });

        const parsed = JSON.parse(response.text || '{}');
        return res.json({ success: true, video: parsed });
      }

      // Fallback AI video tutorial response if GEMINI_API_KEY is absent
      const fallbackVideo = {
        id: `vid-${Date.now()}`,
        title: `DIY Tutorial: ${topic}`,
        category: "Cleanliness",
        difficulty: "Beginner",
        estimatedTime: "2:30 mins",
        description: `Step-by-step technical guide for ${topic} formulated by D&CP Spokane Lab Engineers.`,
        requiredTools: ["99.9% Anhydrous Isopropyl Alcohol", "Precision Microfiber Cloth", "Anti-Static Nylon Spudger"],
        safetyWarnings: ["Ensure device is fully powered down before applying liquids.", "Never apply alcohol directly to open speaker grilles."],
        scenes: [
          {
            stepNumber: 1,
            title: "Bench Environment & Power Down",
            narration: "Before beginning any maintenance, power down the device completely and discharge static electricity using an ESD wrist strap.",
            durationSeconds: 5,
            visualPrompt: "Technician grounding wrist strap and switching off device under ESD ring light.",
            graphicType: "warning",
            highlightRegion: { x: 50, y: 30, label: "Power Switch & ESD Strap" },
            actionTip: "Touch a grounded metal surface before handling delicate circuitry."
          },
          {
            stepNumber: 2,
            title: "Applying Anhydrous Solvents",
            narration: "Apply 2-3 drops of 99.9% Isopropyl Alcohol onto a lint-free microfiber cloth. Do NOT spray solvent directly onto display glass.",
            durationSeconds: 6,
            visualPrompt: "Precision applicator dropping anhydrous IPA onto microfiber cloth weave.",
            graphicType: "cleaning",
            highlightRegion: { x: 45, y: 55, label: "Microfiber Applicator Zone" },
            actionTip: "Higher water percentages in 70% alcohol can seep under display bezels and cause backlight staining."
          },
          {
            stepNumber: 3,
            title: "Circular Buffing & Debris Removal",
            narration: "Gently wipe in small overlapping circular motions, working from the center outward to dissolve finger oils and adhesive residues.",
            durationSeconds: 7,
            visualPrompt: "Magnified view of oleophobic layer restoration and oil residue breakdown.",
            graphicType: "microscope",
            highlightRegion: { x: 50, y: 50, label: "Display Surface Grid" },
            actionTip: "Use uniform light pressure. Excess force can damage delicate anti-reflective coatings."
          },
          {
            stepNumber: 4,
            title: "Final Inspection under UV Telemetry",
            narration: "Inspect the glass under angled LED lighting to ensure zero lint or streaks remain before re-engaging the device.",
            durationSeconds: 6,
            visualPrompt: "Angled inspection light revealing pristine glass surface.",
            graphicType: "tool",
            highlightRegion: { x: 60, y: 40, label: "Inspection Angle" },
            actionTip: "Check perimeter seals for any liquid ingress before powering back on."
          }
        ]
      };

      return res.json({ success: true, video: fallbackVideo });
    } catch (error) {
      console.error('Academy video generator error:', error);
      res.status(500).json({ success: false, error: 'Video generation failed' });
    }
  });

  // Service Booking Drop-Off Reservation API
  app.post('/api/booking/schedule', async (req, res) => {
    try {
      const { 
        date, 
        timeSlot, 
        dropOffType, 
        deviceCategory, 
        serviceTier, 
        customerName, 
        customerEmail, 
        customerPhone, 
        notes 
      } = req.body;

      if (!date || !timeSlot || !customerName || !customerEmail || !customerPhone) {
        return res.status(400).json({ success: false, error: 'Required booking parameters missing.' });
      }

      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const bookingId = `DCP-DROP-${randomSuffix}`;

      const bookingRecord = {
        bookingId,
        date,
        timeSlot,
        dropOffType: dropOffType || 'in_person',
        deviceCategory: deviceCategory || 'iPhone / iOS Device',
        serviceTier: serviceTier || 'tier2',
        customerName,
        customerEmail,
        customerPhone,
        notes: notes || '',
        createdAt: new Date().toISOString()
      };

      console.log('Spokane Lab Drop-Off Reservation Logged:', bookingRecord);

      return res.json({
        success: true,
        booking: bookingRecord
      });
    } catch (error) {
      console.error('Service booking error:', error);
      res.status(500).json({ success: false, error: 'Internal booking reservation error.' });
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
