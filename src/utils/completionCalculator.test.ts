import { describe, it, expect } from 'vitest';
import { calculateDynamicCompletionDate } from './completionCalculator.ts';

describe('calculateDynamicCompletionDate', () => {
  it('calculates completion correctly for Tier 1 service', () => {
    const result = calculateDynamicCompletionDate({
      deviceModel: 'iPhone 13',
      serviceTier: 'Tier 1 (Power/Port Refresh)',
      currentStage: 1,
      queuePosition: 1,
      totalQueueJobs: 4,
      activeTechnicians: 2,
      partsInStock: true,
      priorityExpress: 'standard'
    });

    expect(result.complexityCategory).toContain('Tier 1');
    expect(result.workloadTrafficLevel).toBe('Low Traffic');
    expect(result.partsDelayHours).toBe(0);
    expect(result.totalCalculatedHours).toBeGreaterThan(0);
    expect(result.confidenceScorePercentage).toBeGreaterThanOrEqual(90);
  });

  it('adds 24 hours parts delay if parts are out of stock in early stage', () => {
    const result = calculateDynamicCompletionDate({
      deviceModel: 'Samsung Galaxy S24',
      serviceTier: 'Tier 2 (Display Renewal)',
      currentStage: 1,
      partsInStock: false
    });

    expect(result.partsDelayHours).toBe(24);
    expect(result.totalCalculatedHours).toBeGreaterThan(24);
    expect(result.confidenceScorePercentage).toBeLessThan(96);
  });

  it('reduces wait time when priority express or emergency is selected', () => {
    const standardResult = calculateDynamicCompletionDate({
      deviceModel: 'iPad Pro',
      serviceTier: 'Tier 3 (Board Rework)',
      currentStage: 1,
      queuePosition: 5,
      priorityExpress: 'standard'
    });

    const emergencyResult = calculateDynamicCompletionDate({
      deviceModel: 'iPad Pro',
      serviceTier: 'Tier 3 (Board Rework)',
      currentStage: 1,
      queuePosition: 5,
      priorityExpress: 'emergency'
    });

    expect(emergencyResult.totalCalculatedHours).toBeLessThan(standardResult.totalCalculatedHours);
  });
});
