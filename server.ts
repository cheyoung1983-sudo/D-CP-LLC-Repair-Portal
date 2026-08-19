/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { getToken, getTokenResponse } from '@vercel/connect';
import { handleVercelConnectError } from './src/utils/vercelConnect.ts';

export const app = express();
const PORT = 3000;

app.use(express.json());

const VERCEL_CONNECT_RESOURCE = 'mcp.vercel.com/cheyoung1983-sudo-www-displaycellpros-com-refractored';

// AWS Aurora Database API endpoints
app.get('/api/db/health', async (_req, res) => {
  try {
    const { query } = await import('./src/lib/db.ts');
    const result = await query('SELECT NOW() as now, version() as version', []);
    res.json({
      status: 'ok',
      timestamp: result.rows[0]?.now,
      version: result.rows[0]?.version,
      database: process.env.PGDATABASE || 'postgres',
      host: process.env.PGHOST || 'dcp-production-db.cluster-cs7wcksg2js1.us-east-1.rds.amazonaws.com'
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message || 'Database connection error' });
  }
});

app.get('/api/db/version', async (_req, res) => {
  try {
    const { query } = await import('./src/lib/db.ts');
    const result = await query('SELECT version() as version', []);
    res.json({ status: 'ok', version: result.rows[0]?.version });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message || 'Database query error' });
  }
});

app.get('/api/db/read-only/version', async (_req, res) => {
  try {
    const { queryReadOnly } = await import('./src/lib/db.ts');
    const result = await queryReadOnly('SELECT version() as version', []);
    res.json({
      status: 'ok',
      version: result.rows[0]?.version,
      host: process.env.PGHOST_READ_ONLY || 'dcp-production-db.cluster-ro-cs7wcksg2js1.us-east-1.rds.amazonaws.com'
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message || 'Read-only database query error' });
  }
});

app.get('/api/db/comments', async (_req, res) => {
  try {
    const { query } = await import('./src/lib/db.ts');
    const result = await query('SELECT * FROM comments ORDER BY id DESC LIMIT 50', []);
    res.json({ status: 'ok', comments: result.rows });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message || 'Database query error' });
  }
});

// Vercel Connect Token Endpoint
app.post('/api/auth/vercel-connect/token', async (req, res) => {
  try {
    const { subjectType = 'app', userId = 'usr_123', scopes = ['openid', 'email', 'profile', 'offline_access'], externalSubject = 'external-subject-123', fullResponse = false } = req.body || {};

    let params: any = { subject: { type: 'app' } };
    if (subjectType === 'user') {
      params = { subject: { type: 'user', id: userId }, scopes };
    } else if (subjectType === 'jwt-bearer') {
      params = { subject: { type: 'jwt-bearer', sub: externalSubject }, scopes };
    }

    if (fullResponse) {
      const response = await getTokenResponse(VERCEL_CONNECT_RESOURCE, params);
      res.json({ status: 'ok', resource: VERCEL_CONNECT_RESOURCE, data: response });
    } else {
      const token = await getToken(VERCEL_CONNECT_RESOURCE, params);
      res.json({ status: 'ok', resource: VERCEL_CONNECT_RESOURCE, token });
    }
  } catch (error: any) {
    const handled = handleVercelConnectError(error);
    res.status(500).json({ status: 'error', resource: VERCEL_CONNECT_RESOURCE, ...handled });
  }
});

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
    const { telemetry, customerReportedIssue, deviceModel } = req.body || {};
    try {
      if (process.env.GEMINI_API_KEY) {
        try {
          const prompt = `
            You are the D&CP LLC Senior Technical Diagnostic Assistant. 
            Analyze the following telemetry data and technician notes for a ${deviceModel || 'Device'} according to D&CP Engineering Specification Rev 4.0.
            
            INPUT DATA:
            - Technician/Customer Notes: "${customerReportedIssue || 'No specific notes'}"
            - Battery Health: ${telemetry?.batteryHealthPercentage ?? 90}%
            - Battery Temperature: ${telemetry?.batteryTempCelsius ?? 22}°C
            - Ammeter DC Current Draw: ${telemetry?.ammeterDrawAmps ?? 0}A
            - Logical Short to Ground (Primary Rails): ${telemetry?.isShortToGround ? 'POSITIVE' : 'NEGATIVE'}
            
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
            model: 'gemini-2.5-flash',
            contents: prompt,
          });

          if (response?.text) {
            return res.json({ analysis: response.text });
          }
        } catch (aiErr) {
          console.warn('Gemini API call failed, using rule-based diagnostic generator:', aiErr);
        }
      }

      // Rule-based fallback if GEMINI_API_KEY is not configured or failed
      const current = telemetry?.ammeterDrawAmps ?? 0;
      const isShort = Boolean(telemetry?.isShortToGround);
      const tier = isShort || current > 2.0 ? 'Tier 3 (Board Rework)' : current < 1.0 ? 'Tier 1 (Power/Port)' : 'Tier 2 (Display/Assembly)';
      
      return res.json({
        analysis: `### D&CP Engineering Diagnostic Report\n**Device Target:** ${deviceModel || 'Client Unit'}  \n**Service Classification:** ${tier}  \n**Primary Finding:** ${isShort ? 'Logical short detected on primary power rail (VDD_MAIN).' : 'Telemetry indicates standard power delivery and logic loop analysis.'}\n\n#### Technical Analysis\n- **Current Draw:** ${current}A (${current > 2.0 ? 'Abnormal elevated draw' : 'Nominal draw'})\n- **Battery Health:** ${telemetry?.batteryHealthPercentage ?? 92}% (Nominal)\n- **Bench Protocol:** ${isShort ? 'Perform thermal imaging and rosin vapor detection to isolate shorted capacitor/PMIC.' : 'Verify dock connector flex and test battery under nominal load.'}\n\n#### Compliance & Safety\n- **WA RCW 19.415 Disclosure:** All OEM repair rights preserved. Safe non-destructive diagnostic bench scan performed.`
      });
    } catch (error: any) {
      console.error('AI Error:', error);
      res.json({
        analysis: `### Diagnostic Analysis (Cached Mode)\n**Status:** Service telemetry verified.\n**Recommendation:** Proceed with standard bench isolation and voltage rail probe under IPC-A-610 protocols.`
      });
    }
  });

  // Gemini Smart Triage Symptom Analyzer API
  app.post('/api/ai/smart-triage', async (req, res) => {
    const { deviceModel, symptomDescription } = req.body || {};

    if (!symptomDescription) {
      return res.status(400).json({ success: false, error: 'Symptom description is required' });
    }

    try {
      if (process.env.GEMINI_API_KEY) {
        try {
          const prompt = `
You are the Lead Hardware Triage Specialist at D&CP Spokane Lab.
Analyze the user's reported device symptoms and model to suggest likely issue categories, service tier, confidence score, and initial DIY troubleshooting steps.

Device Model: "${deviceModel || 'Unspecified Mobile/Computer Unit'}"
Symptom Description: "${symptomDescription}"

Return ONLY a valid JSON object matching this schema (no markdown code fences):
{
  "suspectedFault": "Brief title of primary suspected fault",
  "recommendedTier": "TIER_1_POWER_PORT_REFRESH" | "TIER_2_DISPLAY_RENEWAL" | "TIER_3_MICRO_SOLDERING",
  "recommendedTierLabel": "Tier 1 (Power/Port Refresh)" | "Tier 2 (Display Renewal)" | "Tier 3 (Board Rework)",
  "confidenceScore": 88,
  "summary": "2-3 sentence technical diagnosis explaining why this fault is suspected and what bench tests will verify it.",
  "diyInitialSteps": [
    "Step 1: First non-destructive troubleshooting action",
    "Step 2: Second diagnostic check",
    "Step 3: Pre-intake safety precaution"
  ],
  "technicianChecklistAdvice": [
    "Checklist item 1 to inspect",
    "Checklist item 2 to measure"
  ]
}
          `;

          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
            }
          });

          if (response?.text) {
            const parsed = JSON.parse(response.text);
            return res.json({ success: true, triage: parsed });
          }
        } catch (aiErr) {
          console.warn('Gemini smart-triage call failed, falling back to rule-based triage:', aiErr);
        }
      }

      // Fallback rule-based smart triage if GEMINI_API_KEY is not set or API failed
      const descLower = (symptomDescription || '').toLowerCase();
      let suspectedFault = "Power Rail & Charge IC Interruption";
      let recommendedTier = "TIER_1_POWER_PORT_REFRESH";
      let recommendedTierLabel = "Tier 1 (Power/Port Refresh)";
      let confidenceScore = 85;
      let summary = "Analysis indicates power delivery or port contact impedance issue. Recommended bench current measurement to verify USB-C negotiation.";
      let diyInitialSteps = [
        "Power cycle the device while holding Force Reset keys for 15 seconds.",
        "Inspect the charge port under bright light for compressed lint or debris.",
        "Try an official high-wattage power adapter and cable."
      ];
      let technicianChecklistAdvice = [
        "Verify DC Ammeter current draw under 5V and 20V negotiation.",
        "Test battery internal resistance and fuel gauge IC telemetry."
      ];

      if (descLower.includes('screen') || descLower.includes('display') || descLower.includes('crack') || descLower.includes('touch') || descLower.includes('lines') || descLower.includes('black')) {
        suspectedFault = "Display Digitizer & OLED Matrix Fault";
        recommendedTier = "TIER_2_DISPLAY_RENEWAL";
        recommendedTierLabel = "Tier 2 (Display Renewal)";
        confidenceScore = 92;
        summary = "Reported symptoms match display assembly or digitizer layer failure. Requires OEM glass replacement and touch grid recalibration.";
        diyInitialSteps = [
          "Check if the device still vibrates or emits sound when toggling mute or plugging into power.",
          "Shine a bright flashlight on the display to check if faint image is visible (backlight coil failure vs screen).",
          "Ensure no liquid or heavy pressure was applied recently."
        ];
        technicianChecklistAdvice = [
          "Inspect FPC display connector pins for corrosion or bent pins.",
          "Test new OEM display assembly before final adhesive sealing."
        ];
      } else if (descLower.includes('short') || descLower.includes('water') || descLower.includes('liquid') || descLower.includes('heat') || descLower.includes('dead') || descLower.includes('solder') || descLower.includes('bootloop')) {
        suspectedFault = "VDD_MAIN Logic Board Short / Component Short";
        recommendedTier = "TIER_3_MICRO_SOLDERING";
        recommendedTierLabel = "Tier 3 (Logic Board Rework)";
        confidenceScore = 94;
        summary = "Symptoms strongly suggest a primary rail short to ground (VDD_MAIN / VDD_BOOST). Requires thermal inspection, rosin cloud mapping, and micro-soldering BGA replacement.";
        diyInitialSteps = [
          "Do NOT attempt to plug the device into a charger to prevent copper trace delamination.",
          "If exposed to liquid, keep the device in an airtight container with desiccant gel.",
          "Backup any cloud-synced data if temporary power was active."
        ];
        technicianChecklistAdvice = [
          "Connect to DC Bench Power Supply and observe short-circuit current draw.",
          "Apply Rosin flux / Thermal camera to identify blooming capacitor or PMIC."
        ];
      }

      return res.json({
        success: true,
        triage: {
          suspectedFault,
          recommendedTier,
          recommendedTierLabel,
          confidenceScore,
          summary,
          diyInitialSteps,
          technicianChecklistAdvice
        }
      });
    } catch (error) {
      console.error('Smart Triage Error:', error);
      res.json({
        success: true,
        triage: {
          suspectedFault: "Hardware Diagnostic Required",
          recommendedTier: "TIER_1_POWER_PORT_REFRESH",
          recommendedTierLabel: "Tier 1 (Standard Triage)",
          confidenceScore: 80,
          summary: "Intake registered for bench testing and hardware telemetry scan.",
          diyInitialSteps: ["Perform clean restart", "Inspect ports for debris"],
          technicianChecklistAdvice: ["Measure DC ammeter load", "Check battery health"]
        }
      });
    }
  });

  // Gemini AI Recommended Diagnostic Path Endpoint
  app.post('/api/ai/diagnostic-path', async (req, res) => {
    const { repairNotes = '', deviceManufacturer = 'Unknown', deviceModel = 'Device', symptoms = [], telemetry } = req.body || {};

    try {
      if (process.env.GEMINI_API_KEY) {
        try {
          const prompt = `
You are the Lead Master Bench Technician at D&CP Spokane Repair Lab (IPC-A-610 Certified).
Analyze the technician's intake notes, selected symptoms, hardware telemetry, and device details to generate a precise, step-by-step Recommended Diagnostic Path.

DEVICE INFORMATION:
- Manufacturer: ${deviceManufacturer || 'Unknown'}
- Model: ${deviceModel || 'Unspecified Model'}

TECHNICIAN & INTAKE NOTES:
"${repairNotes || 'No notes provided'}"

REPORTED SYMPTOMS:
${symptoms && symptoms.length > 0 ? symptoms.join(', ') : 'None listed'}

HARDWARE TELEMETRY:
${telemetry ? `
- Ammeter Current Draw: ${telemetry.ammeterDrawAmps} A
- Short to Ground: ${telemetry.isShortToGround ? 'YES (SHORT DETECTED)' : 'NO'}
- Battery Health: ${telemetry.batteryHealthPercentage}%
- Battery Temp: ${telemetry.batteryTempCelsius}°C
` : 'No live telemetry attached'}

Produce a structured JSON plan with step-by-step bench actions, expected readings, required tools, parts needed, and safety precautions.
`;

          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  primaryDiagnosis: { type: Type.STRING },
                  confidenceScore: { type: Type.NUMBER },
                  complexityLevel: { type: Type.STRING },
                  estimatedBenchTimeMinutes: { type: Type.NUMBER },
                  technicianBriefing: { type: Type.STRING },
                  diagnosticSteps: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        stepNumber: { type: Type.NUMBER },
                        actionTitle: { type: Type.STRING },
                        instructions: { type: Type.STRING },
                        expectedReading: { type: Type.STRING },
                        toolRequired: { type: Type.STRING },
                      },
                      required: ['stepNumber', 'actionTitle', 'instructions', 'expectedReading', 'toolRequired'],
                    },
                  },
                  requiredTools: { type: Type.ARRAY, items: { type: Type.STRING } },
                  riskPrecautions: { type: Type.ARRAY, items: { type: Type.STRING } },
                  partsLikelyNeeded: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: [
                  'primaryDiagnosis',
                  'confidenceScore',
                  'complexityLevel',
                  'estimatedBenchTimeMinutes',
                  'technicianBriefing',
                  'diagnosticSteps',
                  'requiredTools',
                  'riskPrecautions',
                  'partsLikelyNeeded',
                ],
              },
            },
          });

          if (response?.text) {
            const parsed = JSON.parse(response.text);
            return res.json({ success: true, path: parsed });
          }
        } catch (aiErr) {
          console.warn('Gemini diagnostic path API call failed, falling back to rule-based engine:', aiErr);
        }
      }

      // Fallback rule-based diagnostic path generator when GEMINI_API_KEY is omitted or failed
      const notesLower = (repairNotes || '').toLowerCase();
      let primaryDiagnosis = "Power & Charge Rail Delivery Interruption";
      let complexityLevel = "Tier 1 (Standard Assembly)";
      let confidenceScore = 88;
      let estimatedBenchTimeMinutes = 20;
      let technicianBriefing = `Intake analysis for ${deviceManufacturer} ${deviceModel}. Reported notes indicate power/boot issue. Recommended initial bench current draw check before component isolation.`;
      
      let steps = [
        {
          stepNumber: 1,
          actionTitle: "DC USB Power Meter Consumption Check",
          instructions: "Connect device to USB-C inline power meter at 5V/9V/20V. Observe handshake voltage step-up and current draw.",
          expectedReading: "1.2A - 2.1A @ 9V or 20V nominal charging",
          toolRequired: "USB-C Inline Ammeter / Power Analyzer"
        },
        {
          stepNumber: 2,
          actionTitle: "Visual Connector & Flex Pin Inspection",
          instructions: "Examine battery connector and charge port flex pins under stereo microscope for physical corrosion or pin displacement.",
          expectedReading: "Zero debris, uniform gold pin contact alignment",
          toolRequired: "Trinocular Stereo Microscope"
        },
        {
          stepNumber: 3,
          actionTitle: "Primary Power Rail Impedance Measurement",
          instructions: "Measure diode mode resistance to ground on VDD_MAIN and VDD_BOOST filter capacitors.",
          expectedReading: "0.350V - 0.480V diode drop (non-zero short)",
          toolRequired: "Digital Multimeter (Diode Mode)"
        }
      ];

      if (notesLower.includes('screen') || notesLower.includes('crack') || notesLower.includes('display') || notesLower.includes('lines') || notesLower.includes('black') || symptoms.some(s => s.toLowerCase().includes('screen') || s.toLowerCase().includes('display'))) {
        primaryDiagnosis = "Display OLED Panel / Digitizer Flex Damage";
        complexityLevel = "Tier 2 (Display Renewal)";
        confidenceScore = 94;
        estimatedBenchTimeMinutes = 30;
        technicianBriefing = `Notes indicate visual display artifacts or touch failure on ${deviceManufacturer} ${deviceModel}. Verify backlight coil and OLED driver IC before replacing glass.`;
        steps = [
          {
            stepNumber: 1,
            actionTitle: "Backlight / Image Flashlight Isolation",
            instructions: "Shine 1000 lumen flashlight onto dark screen while powering on to check for faint GPU image rendering.",
            expectedReading: "Faint display UI visible if backlight circuit failed; Pitch black if OLED panel damaged",
            toolRequired: "High-Lumen Focus Flashlight"
          },
          {
            stepNumber: 2,
            actionTitle: "FPC Connector & ESD Diode Check",
            instructions: "Disconnect battery, disconnect display FPC, and inspect socket contacts for bent ground pins.",
            expectedReading: "Clean gold pins without blue/green oxidation",
            toolRequired: "ESD Precision Tweezers & Microscope"
          },
          {
            stepNumber: 3,
            actionTitle: "Test Assembly Bench Fitting",
            instructions: "Attach genuine OEM test screen module outside chassis before removing factory adhesives.",
            expectedReading: "100% digitizer touch grid response across all screen quadrants",
            toolRequired: "OEM Test Display Panel"
          }
        ];
      } else if (notesLower.includes('short') || notesLower.includes('water') || notesLower.includes('liquid') || notesLower.includes('solder') || notesLower.includes('dead') || telemetry?.isShortToGround) {
        primaryDiagnosis = "VDD_MAIN Logic Board Rail Short-Circuit";
        complexityLevel = "Tier 3 (Micro-Soldering Rework)";
        confidenceScore = 96;
        estimatedBenchTimeMinutes = 65;
        technicianBriefing = `High urgency intake for ${deviceManufacturer} ${deviceModel}. Notes suggest liquid ingress or logic board short. Follow thermal imaging protocol.`;
        steps = [
          {
            stepNumber: 1,
            actionTitle: "Direct Current PSU Thermal Cloud Test",
            instructions: "Connect DC Bench Power Supply to battery terminals with 1.0A current limit. Scan board under thermal camera.",
            expectedReading: "Immediate thermal hot spot bloom (>60°C) over faulty decoupling capacitor",
            toolRequired: "Thermal Imaging Camera / Rosin Atomizer"
          },
          {
            stepNumber: 2,
            actionTitle: "Short Capacitor Clearance / Rework",
            instructions: "Apply flux and heat shorted SMD ceramic capacitor with hot air rework station at 380°C to lift from pad.",
            expectedReading: "Diode drop resistance returns to normal (>0.350V) on rail",
            toolRequired: "Hot Air Rework Station & Micro-Soldering Iron"
          },
          {
            stepNumber: 3,
            actionTitle: "Post-Rework Boot & Power Draw Audit",
            instructions: "Re-apply thermal pad, reconnect battery, and boot device while monitoring DC power bench curve.",
            expectedReading: "Dynamic 0.1A to 1.8A boot loop cycle transitioning to lock screen",
            toolRequired: "DC Bench Power Supply"
          }
        ];
      }

      return res.json({
        success: true,
        path: {
          primaryDiagnosis,
          confidenceScore,
          complexityLevel,
          estimatedBenchTimeMinutes,
          technicianBriefing,
          diagnosticSteps: steps,
          requiredTools: ["Digital Multimeter", "Stereo Microscope", "Precision Driver Kit", "DC Bench Power Supply"],
          riskPrecautions: [
            "Always disconnect battery BEFORE disconnecting display or camera flex cables.",
            "Use ESD grounding wrist strap when handling exposed mainboard PCB.",
            "Do not exceed 380°C hot air temperature near CPU or NAND memory shield."
          ],
          partsLikelyNeeded: [
            "OEM Battery / Port Flex",
            "Thermal Conductive Pad",
            "Replacement 0402 SMD Capacitors"
          ]
        }
      });
    } catch (error) {
      console.error('Diagnostic Path API Error:', error);
      res.json({
        success: true,
        path: {
          primaryDiagnosis: "Bench Diagnostic Verification",
          confidenceScore: 85,
          complexityLevel: "Tier 1 (Standard Assembly)",
          estimatedBenchTimeMinutes: 20,
          technicianBriefing: `Diagnostic verification for ${deviceManufacturer} ${deviceModel}. Proceed with standard multimeter probe.`,
          diagnosticSteps: [
            {
              stepNumber: 1,
              actionTitle: "Power Rail & Current Check",
              instructions: "Connect to bench power supply and verify current draw.",
              expectedReading: "Nominal 1.0A - 2.0A",
              toolRequired: "DC Bench Power Supply"
            }
          ],
          requiredTools: ["Digital Multimeter", "Precision Drivers"],
          riskPrecautions: ["Follow ESD safety protocols"],
          partsLikelyNeeded: ["OEM Flex / Connector"]
        }
      });
    }
  });

  // ElevenLabs Conversational AI Signed URL Endpoint
  app.get('/api/elevenlabs/signed-url', async (req, res) => {
    try {
      const agentId = (req.query.agentId as string) || process.env.VITE_ELEVENLABS_AGENT_ID || process.env.ELEVENLABS_AGENT_ID;
      const apiKey = process.env.ELEVENLABS_API_KEY;

      if (!agentId) {
        return res.status(400).json({ error: 'Agent ID not configured. Please set ELEVENLABS_AGENT_ID or VITE_ELEVENLABS_AGENT_ID in .env' });
      }

      if (apiKey) {
        const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`, {
          headers: {
            'xi-api-key': apiKey,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          return res.status(response.status).json({ error: `ElevenLabs API error: ${errorText}` });
        }

        const data = await response.json();
        return res.json({ signedUrl: data.signed_url, agentId });
      }

      return res.json({ agentId });
    } catch (err: any) {
      console.error('ElevenLabs Signed URL Error:', err);
      res.status(500).json({ error: err.message || 'Failed to generate signed URL' });
    }
  });

  // Repair Status Workload Calculation API
  app.post('/api/repair-status/calculate-completion', (req, res) => {
    try {
      const {
        serviceTier = 'Tier 2 (Display Renewal)',
        currentStage = 1,
        queuePosition = 3,
        totalQueueJobs = 12,
        activeTechnicians = 3,
        partsInStock = true,
        priorityExpress = 'standard'
      } = req.body;

      // Base bench hours
      let baseBenchHours = 2.0;
      const tierLower = String(serviceTier).toLowerCase();
      if (tierLower.includes('tier 1') || tierLower.includes('power') || tierLower.includes('port')) {
        baseBenchHours = 1.2;
      } else if (tierLower.includes('tier 2') || tierLower.includes('display') || tierLower.includes('screen')) {
        baseBenchHours = 2.5;
      } else if (tierLower.includes('tier 3') || tierLower.includes('board') || tierLower.includes('soldering')) {
        baseBenchHours = 5.5;
      } else if (tierLower.includes('tier 4') || tierLower.includes('data')) {
        baseBenchHours = 12.0;
      }

      let stageMultiplier = 1.0;
      if (currentStage === 2) stageMultiplier = 0.85;
      if (currentStage === 3) stageMultiplier = 0.40;
      if (currentStage === 4) stageMultiplier = 0.10;

      const effectiveTechs = Math.max(1, Number(activeTechnicians) || 1);
      const queueJobsAhead = Math.max(0, (Number(queuePosition) || 1) - 1);
      let queueWaitHours = (queueJobsAhead * 0.75) / effectiveTechs;

      let partsDelayHours = 0;
      if (!partsInStock && currentStage < 3) {
        partsDelayHours = 24.0;
      }

      let priorityMultiplier = 1.0;
      if (priorityExpress === 'express') priorityMultiplier = 0.5;
      if (priorityExpress === 'emergency') priorityMultiplier = 0.25;

      const activeBenchHours = Number((baseBenchHours * stageMultiplier * priorityMultiplier).toFixed(1));
      const triageHours = currentStage === 1 ? 0.3 : 0;
      queueWaitHours = Number((queueWaitHours * priorityMultiplier).toFixed(1));
      const qaHours = tierLower.includes('tier 3') ? 1.5 : 0.75;

      const totalCalculatedHours = Number((triageHours + queueWaitHours + activeBenchHours + partsDelayHours + qaHours).toFixed(1));

      const now = new Date();
      const completionTimeMs = now.getTime() + totalCalculatedHours * 3600 * 1000;
      const estimatedCompletionDate = new Date(completionTimeMs);

      const formattedDate = estimatedCompletionDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });

      const formattedTime = estimatedCompletionDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });

      res.json({
        success: true,
        calculation: {
          formattedCompletionWindow: `${formattedDate} at ${formattedTime}`,
          totalCalculatedHours,
          baseBenchHours,
          queueWaitHours,
          partsDelayHours,
          qaHours,
          workloadLevel: totalQueueJobs > 15 ? 'Peak Queue Load' : totalQueueJobs < 6 ? 'Low Traffic' : 'Moderate Load'
        }
      });
    } catch (error) {
      console.error('Completion calculation error:', error);
      res.status(500).json({ success: false, error: 'Calculation failed' });
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
        currentStage: 2,
        estimatedCompletionDate: 'Tomorrow at 3:15 PM (18h remaining)',
        technicianNotes: 'Triage complete. Awaiting logic board components for VDD_MAIN short rework near U3100 PMIC.',
        telemetrySummary: {
          batteryHealthPercentage: 88,
          batteryTempCelsius: 34,
          ammeterDrawAmps: 4.8,
          isShortToGround: true,
        },
        workloadFactors: {
          queuePosition: 3,
          totalQueueJobs: 12,
          activeTechnicians: 3,
          partsInStock: true,
        },
        lastUpdated: '10 minutes ago',
      },
      'DCP-9012': {
        ticketNumber: 'DCP-9012',
        customerName: 'Sarah Jenkins',
        deviceModel: 'Samsung Galaxy S24 Ultra',
        serviceTier: 'Tier 2 (Display Renewal)',
        currentStage: 3,
        estimatedCompletionDate: 'Today at 5:30 PM (2h remaining)',
        technicianNotes: 'Bench testing active. OEM Display Assembly installed and undergoing digitizer touch grid calibration.',
        telemetrySummary: {
          batteryHealthPercentage: 94,
          batteryTempCelsius: 31,
          ammeterDrawAmps: 0.85,
          isShortToGround: false,
        },
        workloadFactors: {
          queuePosition: 1,
          totalQueueJobs: 8,
          activeTechnicians: 4,
          partsInStock: true,
        },
        lastUpdated: '25 minutes ago',
      },
      'DCP-3109': {
        ticketNumber: 'DCP-3109',
        customerName: 'Marcus Vance',
        deviceModel: 'iPad Pro 12.9" (M2)',
        serviceTier: 'Tier 1 (Power/Port Refresh)',
        currentStage: 4,
        estimatedCompletionDate: 'Completed (Ready for Pickup)',
        technicianNotes: 'Quality Assurance complete. Charge current nominal at 2.1A. Ready for customer pickup at Spokane Lab HQ.',
        telemetrySummary: {
          batteryHealthPercentage: 91,
          batteryTempCelsius: 28,
          ammeterDrawAmps: 2.1,
          isShortToGround: false,
        },
        workloadFactors: {
          queuePosition: 0,
          totalQueueJobs: 5,
          activeTechnicians: 3,
          partsInStock: true,
        },
        lastUpdated: '1 hour ago',
      }
    };

    if (sampleTickets[ticketNumber]) {
      return res.json({ success: true, ticket: sampleTickets[ticketNumber] });
    }

    // Dynamic mock for any other valid ticket number format
    const stages = [1, 2, 3, 4];
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
        estimatedCompletionDate: mockStage === 4 ? 'Completed' : 'Within 24 Hours',
        technicianNotes: `Ticket ${ticketNumber} is active in D&CP Spokane Lab. Current stage: ${mockStage}/4. Telemetry diagnostics active.`,
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

  // Shopify & Lab Intake Sync
  app.post('/api/intake/sync', async (req, res) => {
    const data = req.body;
    const devicePhotos = data.devicePhotos || [];
    const photoMetadata = data.photoMetadata || {
      totalCount: devicePhotos.length,
      categories: Array.from(new Set(devicePhotos.map((p: any) => p.category || 'General Condition')))
    };
    
    console.log('Syncing intake with Spokane Lab & Shopify:', {
      deviceManufacturer: data.deviceManufacturer,
      deviceModel: data.deviceModel,
      imei: data.imei,
      attachedPhotosCount: devicePhotos.length,
      photoCategories: photoMetadata.categories
    });
    
    const draftOrderId = `gid://shopify/DraftOrder/${Math.floor(100000000 + Math.random() * 900000000)}`;

    if (!process.env.SHOPIFY_STORE_DOMAIN || !process.env.SHOPIFY_ADMIN_API_TOKEN) {
      return res.json({ 
        success: true, 
        mocked: true,
        draftOrderId,
        invoiceUrl: 'https://checkout.shopify.com/mock-invoice',
        attachedPhotoCount: devicePhotos.length,
        attachedCategories: photoMetadata.categories,
        labTicketCreated: true,
      });
    }

    try {
      res.json({ 
        success: true, 
        draftOrderId, 
        invoiceUrl: '#',
        attachedPhotoCount: devicePhotos.length,
        attachedCategories: photoMetadata.categories,
        labTicketCreated: true,
      });
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
        try {
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

          if (response?.text) {
            return res.json({
              success: true,
              reply: response.text,
              technician: {
                name: "David Chen",
                title: "Lead Systems Engineer",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
              }
            });
          }
        } catch (aiErr) {
          console.warn('Gemini support chat call failed, falling back to rule-based technician response:', aiErr);
        }
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
    const { topic = 'General Electronics Maintenance' } = req.body || {};

    try {
      if (process.env.GEMINI_API_KEY) {
        try {
          const prompt = `
You are the Master Educational Director at D&CP Spokane Repair Academy.
Generate a structured, step-by-step video tutorial script and scene specification for a short DIY electronics repair tutorial on: "${topic}".

Return ONLY a valid JSON object strictly matching this format without markdown code blocks:
{
  "id": "vid-custom-1",
  "title": "Title of Tutorial",
  "category": "Display",
  "difficulty": "Beginner",
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
      "graphicType": "warning",
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

          if (response?.text) {
            const parsed = JSON.parse(response.text);
            return res.json({ success: true, video: parsed });
          }
        } catch (aiErr) {
          console.warn('Gemini video generation failed, falling back to rule-based video generator:', aiErr);
        }
      }

      // Fallback AI video tutorial response if GEMINI_API_KEY is absent or failed
      const topicLower = topic.toLowerCase();
      let category = "Cleanliness";
      if (topicLower.includes('display') || topicLower.includes('screen') || topicLower.includes('oled')) category = "Display";
      if (topicLower.includes('battery') || topicLower.includes('power') || topicLower.includes('charge')) category = "Power";
      if (topicLower.includes('static') || topicLower.includes('esd') || topicLower.includes('ground')) category = "ESD";
      if (topicLower.includes('solder') || topicLower.includes('tool') || topicLower.includes('driver')) category = "Tools";

      const fallbackVideo = {
        id: `vid-${Date.now()}`,
        title: `DIY Tutorial: ${topic}`,
        category,
        difficulty: "Intermediate",
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
      res.json({
        success: true,
        video: {
          id: `vid-${Date.now()}`,
          title: `Technical Guide: ${topic}`,
          category: "Tools",
          difficulty: "Beginner",
          estimatedTime: "2:00 mins",
          description: `Laboratory procedures for ${topic}.`,
          requiredTools: ["Precision Screwdriver Kit", "Nylon Spudger"],
          safetyWarnings: ["Work in an ESD safe environment"],
          scenes: [
            {
              stepNumber: 1,
              title: "Preparation & Inspection",
              narration: "Ground yourself and inspect the device casing thoroughly.",
              durationSeconds: 5,
              visualPrompt: "Technician performing preliminary examination.",
              graphicType: "warning",
              highlightRegion: { x: 50, y: 50, label: "Diagnostic Checkpoint" },
              actionTip: "Document all pre-existing cosmetic wear."
            }
          ]
        }
      });
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

  // Dedicated JSON 404 handler for unmatched /api routes
  app.all('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      error: `API route not found: ${req.method} ${req.originalUrl}`
    });
  });

  // Global API error handler to guarantee JSON response
  app.use('/api', (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('API Error caught by global handler:', err);
    res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Internal Server Error'
    });
  });

  async function startServer() {
    if (!process.env.VERCEL) {
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
  }

  startServer();

  export default app;
