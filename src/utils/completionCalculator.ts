export interface LabWorkloadParameters {
  deviceModel: string;
  serviceTier: string; // e.g. 'Tier 1 (Power/Port Refresh)', 'Tier 2 (Display Renewal)', 'Tier 3 (Board Rework)', 'Tier 4 (Data Recovery)'
  currentStage: number; // 1: Triage, 2: Parts Ordering, 3: Bench Testing, 4: Quality Assurance
  queuePosition?: number;
  totalQueueJobs?: number;
  activeTechnicians?: number;
  partsInStock?: boolean;
  priorityExpress?: 'standard' | 'express' | 'emergency';
  intakeDate?: Date;
}

export interface CompletionCalculationResult {
  estimatedCompletionDate: Date;
  formattedDate: string;
  formattedTime: string;
  relativeHoursRemaining: number;
  humanizedCountdown: string;
  complexityCategory: string;
  baseBenchHours: number;
  queueWaitHours: number;
  partsDelayHours: number;
  qaTestingHours: number;
  totalCalculatedHours: number;
  workloadTrafficLevel: 'Low Traffic' | 'Moderate Load' | 'Peak Queue Load';
  confidenceScorePercentage: number;
  breakdown: {
    triageHours: number;
    queueWaitHours: number;
    activeBenchHours: number;
    partsDelayHours: number;
    qaStressTestHours: number;
  };
}

/**
 * Dynamic Estimated Completion Date Calculator
 * Calculates accurate lab completion target based on:
 * - Repair Complexity Tier (Base Bench Time)
 * - Current Lab Workload & Queue Density
 * - Active Bench Technicians on Shift
 * - Parts Stock & Freight Logistics
 * - Current Progress Stage (Stage 1-4)
 * - Priority Speed Tier (Standard / Express / Emergency)
 */
export function calculateDynamicCompletionDate(params: LabWorkloadParameters): CompletionCalculationResult {
  const {
    serviceTier = 'Tier 2 (Display Renewal)',
    currentStage = 1,
    queuePosition = 3,
    totalQueueJobs = 12,
    activeTechnicians = 3,
    partsInStock = true,
    priorityExpress = 'standard',
    intakeDate = new Date()
  } = params;

  // 1. Determine Base Bench Hours & Complexity Category
  let baseBenchHours = 2.0;
  let complexityCategory = 'Standard Assembly Rework';

  const tierLower = serviceTier.toLowerCase();
  if (tierLower.includes('tier 1') || tierLower.includes('power') || tierLower.includes('port')) {
    baseBenchHours = 1.2;
    complexityCategory = 'Tier 1 — Port & Battery Refresh';
  } else if (tierLower.includes('tier 2') || tierLower.includes('display') || tierLower.includes('screen')) {
    baseBenchHours = 2.5;
    complexityCategory = 'Tier 2 — Display & Glass Bonding';
  } else if (tierLower.includes('tier 3') || tierLower.includes('board') || tierLower.includes('soldering') || tierLower.includes('rework')) {
    baseBenchHours = 5.5;
    complexityCategory = 'Tier 3 — Micro-Soldering IC Rework';
  } else if (tierLower.includes('tier 4') || tierLower.includes('bga') || tierLower.includes('data') || tierLower.includes('forensic')) {
    baseBenchHours = 12.0;
    complexityCategory = 'Tier 4 — Forensic Data & BGA Reball';
  }

  // 2. Account for Current Stage Progress
  // If stage 4 (QA), remaining active bench time is low, only QA remains.
  // Stage 1: 100% remaining
  // Stage 2: 85% remaining (parts in progress)
  // Stage 3: 40% remaining (bench testing active)
  // Stage 4: 10% remaining (final QA lock)
  let stageMultiplier = 1.0;
  if (currentStage === 2) stageMultiplier = 0.85;
  if (currentStage === 3) stageMultiplier = 0.40;
  if (currentStage === 4) stageMultiplier = 0.10;

  // 3. Queue Wait Calculation based on total queue & tech capacity
  // Average jobs ahead per tech = queuePosition / activeTechnicians
  const effectiveTechs = Math.max(1, activeTechnicians);
  const queueJobsAhead = Math.max(0, queuePosition - 1);
  let queueWaitHours = (queueJobsAhead * 0.75) / effectiveTechs;

  // 4. Lab Workload Traffic Level
  let workloadTrafficLevel: 'Low Traffic' | 'Moderate Load' | 'Peak Queue Load' = 'Moderate Load';
  if (totalQueueJobs <= 5) workloadTrafficLevel = 'Low Traffic';
  else if (totalQueueJobs >= 16) workloadTrafficLevel = 'Peak Queue Load';

  if (workloadTrafficLevel === 'Peak Queue Load') {
    queueWaitHours *= 1.3;
  } else if (workloadTrafficLevel === 'Low Traffic') {
    queueWaitHours *= 0.7;
  }

  // 5. Parts Delay Hours
  let partsDelayHours = 0;
  if (!partsInStock) {
    partsDelayHours = currentStage >= 3 ? 0 : 24.0; // 24 hour express shipping delay if not in stock
  }

  // 6. QA Testing Hours
  let qaStressTestHours = 0.75; // 45 min thermal QA test default
  if (tierLower.includes('tier 3') || tierLower.includes('tier 4')) {
    qaStressTestHours = 1.5; // 90 min stress test for board rework
  }

  // 7. Priority Express Multiplier
  let priorityMultiplier = 1.0;
  if (priorityExpress === 'express') priorityMultiplier = 0.5; // Cuts queue wait in half
  if (priorityExpress === 'emergency') priorityMultiplier = 0.25; // Priority bench allocation

  const activeBenchHours = Number((baseBenchHours * stageMultiplier * priorityMultiplier).toFixed(1));
  const triageHours = currentStage === 1 ? 0.3 : 0;
  queueWaitHours = Number((queueWaitHours * priorityMultiplier).toFixed(1));

  // Total calculated hours from right now
  const totalCalculatedHours = Number(
    (triageHours + queueWaitHours + activeBenchHours + partsDelayHours + qaStressTestHours).toFixed(1)
  );

  // Completion Date object
  const startTime = new Date(intakeDate.getTime() > 0 ? intakeDate.getTime() : Date.now());
  const completionTimestamp = startTime.getTime() + totalCalculatedHours * 3600 * 1000;
  const estimatedCompletionDate = new Date(completionTimestamp);

  // Formatting helpers
  const formattedDate = estimatedCompletionDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const formattedTime = estimatedCompletionDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const relativeHoursRemaining = Math.max(0.1, Number(totalCalculatedHours.toFixed(1)));

  // Humanized countdown string
  let humanizedCountdown = '';
  if (currentStage === 4 && relativeHoursRemaining < 1) {
    humanizedCountdown = 'Final QA Lockout (~30 mins)';
  } else if (relativeHoursRemaining < 1) {
    humanizedCountdown = `${Math.round(relativeHoursRemaining * 60)} minutes`;
  } else if (relativeHoursRemaining < 24) {
    const hrs = Math.floor(relativeHoursRemaining);
    const mins = Math.round((relativeHoursRemaining - hrs) * 60);
    humanizedCountdown = `${hrs}h ${mins > 0 ? `${mins}m` : ''}`;
  } else {
    const days = Math.floor(relativeHoursRemaining / 24);
    const remainingHrs = Math.round(relativeHoursRemaining % 24);
    humanizedCountdown = `${days} day${days > 1 ? 's' : ''} ${remainingHrs > 0 ? `${remainingHrs}h` : ''}`;
  }

  // Model Confidence Score based on stock & predictability
  let confidenceScorePercentage = 96;
  if (!partsInStock) confidenceScorePercentage -= 12;
  if (workloadTrafficLevel === 'Peak Queue Load') confidenceScorePercentage -= 6;
  if (tierLower.includes('tier 4')) confidenceScorePercentage -= 8;
  confidenceScorePercentage = Math.max(70, Math.min(99, confidenceScorePercentage));

  return {
    estimatedCompletionDate,
    formattedDate,
    formattedTime,
    relativeHoursRemaining,
    humanizedCountdown,
    complexityCategory,
    baseBenchHours,
    queueWaitHours,
    partsDelayHours,
    qaTestingHours: qaStressTestHours,
    totalCalculatedHours,
    workloadTrafficLevel,
    confidenceScorePercentage,
    breakdown: {
      triageHours,
      queueWaitHours,
      activeBenchHours,
      partsDelayHours,
      qaStressTestHours
    }
  };
}
